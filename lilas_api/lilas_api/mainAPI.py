from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from users.main import router as user_router
from customers.main_cus import router as customer_router
from suppliers.main_sup import router as supplier_router
from invoice.main_invoice import router as invoice_router
from products.main_pro import router as product_router
from imports_inspection.main_i_d import router as import_bill_router
from delivery.main_de import router as delivery_router
from contextlib import asynccontextmanager
from scheduler import start_scheduler, stop_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event
    start_scheduler()
    yield
    # Shutdown event
    stop_scheduler()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    # allow_origins=[], 
    # allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(customer_router, prefix="/customers", tags=["Customers"])
app.include_router(supplier_router, prefix="/suppliers", tags=["Suppliers"])
app.include_router(product_router, prefix="/products", tags=["Products"])
app.include_router(import_bill_router, prefix="/import_inspection", tags=["Import And Inspection"])
app.include_router(invoice_router, prefix="/invoices", tags=["Invoices"])
app.include_router(delivery_router, prefix="/deliveries", tags=["Deliveries"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
