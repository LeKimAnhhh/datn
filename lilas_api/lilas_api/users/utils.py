from imports_inspection.models import ImportBill, ReturnBill, ReturnBillItem
from invoice.models import Invoice
from products.models import Product
from sqlalchemy.orm import Session
from decimal import Decimal

def calculate_invoice_status(invoice: Invoice, delivery_status: str = None):
    if delivery_status:
        return delivery_status
    if invoice.status == "cancel":
        return "cancel"
    # if invoice.deposit > 0 and invoice.is_delivery and invoice.delivery_partner:
    #     return "delivering"
    # if not invoice.is_delivery and invoice.deposit == 0:
    #     return "delivered"
    return "ready_to_pick"

def calculate_payment_status(invoice: Invoice):
    if invoice.status == "cancel":
        return "unpaid"
    if invoice.status == "delivered":
        return "paid"
    if invoice.deposit > 0 and invoice.deposit < invoice.total_value:
        return "partial_payment"
    elif invoice.deposit == invoice.total_value:
        return "paid"
    elif invoice.deposit > invoice.total_value:
        return "paid"
    else:
        pass
    return "unpaid"


def calculate_invoice_total_and_status(invoice: Invoice):
    line_total = 0.0

    # giá trị từng dòng (items)
    for item in invoice.items:
        raw_line = item.price * item.quantity
        if item.discount_type == "%":
            line_discounted = raw_line * (1 - (item.discount / 100))
        else:
            line_discounted = raw_line - item.discount
        line_total += max(line_discounted, 0)

    # giá trị từng dòng (service_items)
    for service in invoice.service_items:
        raw_line = service.price * service.quantity
        if service.discount_type == "%":
            line_discounted = raw_line * (1 - (service.discount / 100))
        else:
            line_discounted = raw_line - service.discount
        line_total += max(line_discounted, 0)

    if invoice.discount_type == "%":
        final_total = line_total * (1 - (invoice.discount / 100))
    else:
        final_total = line_total - invoice.discount

    final_total = max(final_total, 0)
    invoice.total_value = final_total

    # nếu đơn không giao hàng, tự động đặt status 'delivered' và payment_status 'paid'
    # if not invoice.is_delivery:
    #     invoice.status = "delivered"
    #     invoice.payment_status = "paid"
    # else:
    #     invoice.status = calculate_invoice_status(invoice)
    #     invoice.payment_status = calculate_payment_status(invoice)

    invoice.status = calculate_invoice_status(invoice)
    invoice.payment_status = calculate_payment_status(invoice)

    return invoice


def calculate_import_total(import_bill: ImportBill):
    line_total = 0.0
    for item in import_bill.items:
        raw_line = item.price * item.quantity
        line_discounted = raw_line * (1 - (item.discount / 100.0))
        item.total_line = line_discounted
        line_total += line_discounted

    after_discount = line_total * (1 - (import_bill.discount / 100.0))
    final_total = after_discount + import_bill.extra_fee

    import_bill.total_value = final_total if final_total > 0 else 0
    return import_bill

def calculate_return_total(db: Session, return_bill: ReturnBill) -> None:
    total = Decimal("0.0")

    for item in return_bill.items:
        raw_line = Decimal(str(item.price)) * item.quantity
        discount_line = raw_line * Decimal(str(item.discount / 100.0))
        line_value = raw_line - discount_line
        item.total_line = float(line_value)
        total += line_value

    if return_bill.discount > 0:
        total_discount_bill = total * Decimal(str(return_bill.discount / 100.0))
        total -= total_discount_bill

    total += Decimal(str(return_bill.extra_fee))

    return_bill.total_value = float(total)
    db.commit()
    db.refresh(return_bill)

def update_price_import_for_product(db, product: Product, qty_in: int, cost_in: float):
    """
    công thức MAC:
      price_import_new = (A + B) / (C)
    với:
      A = old_stock * old_price_import
      B = qty_in * cost_in
      C = old_stock + qty_in
    old_stock = product.terra_stock + product.thonhuom_stock (tổng tồn)
    """
    old_stock = product.terra_stock + product.thonhuom_stock
    if old_stock < 0:
        old_stock = 0

    old_price = product.price_import
    new_stock = old_stock + qty_in
    if new_stock <= 0:
        return

    A = Decimal(str(old_stock)) * Decimal(str(old_price))
    B = Decimal(str(qty_in)) * Decimal(str(cost_in))
    C = Decimal(str(new_stock))

    new_price = (A + B) / C

    print(f"\n--- UTILS GIÁ NHẬP SP ---")
    print(f"ProductID: {product.id}")
    print(f"Old Stock: {old_stock} | Old Price: {old_price}")
    print(f"Nhập: {qty_in} * {cost_in} = {B}")
    print(f"A = {A}, B = {B}, C = {C}")
    print(f"→ New Price Import = ({A} + {B}) / {C} = {new_price}")

    product.price_import = float(new_price)
    db.commit()
    db.refresh(product)


def reduce_price_import_for_product(db, product: Product, qty_out: int, cost_out: float):
    """
    price_import_new = (A - B)/C
    A = old_stock * old_price
    B = qty_out * cost_out
    C = old_stock - qty_out
    """
    old_stock = product.terra_stock + product.thonhuom_stock
    old_price = product.price_import

    print(f"\n--- GIÁ NHẬP SAU TRẢ HÀNG ---")
    print(f"Product ID: {product.id}")
    print(f"Old Stock: {old_stock} = {product.terra_stock} + {product.thonhuom_stock}")
    print(f"Old Price Import: {old_price}")
    print(f"Số lượng trả (qty_out): {qty_out}")
    print(f"Giá thực tế (cost_out): {cost_out}")
    
    new_stock = old_stock - qty_out
    if new_stock <= 0:
        new_price = cost_out
        print(f"→ new_stock <= 0, New Price Import: {new_price}")
        product.price_import = float(new_price)
        db.commit()
        db.refresh(product)
        return

    A = Decimal(str(old_stock)) * Decimal(str(old_price))
    B = Decimal(str(qty_out)) * Decimal(str(cost_out))
    C = Decimal(str(new_stock))
    new_price = (A - B) / C

    print(f"A = {old_stock} * {old_price} = {A}")
    print(f"B = {qty_out} * {cost_out} = {B}")
    print(f"C = {new_stock}")
    print(f"→ New Price Import = (A - B) / C = ({A} - {B}) / {C} = {new_price}")

    product.price_import = float(new_price)
    db.commit()
    db.refresh(product)
