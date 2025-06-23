from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from delivery.main_de import update_all_statuses
from users.dependencies import get_db

scheduler = BackgroundScheduler()

def update_all_statuses_job():
    db = next(get_db())
    try:
        update_all_statuses(db)
    finally:
        db.close()

def start_scheduler():
    scheduler.add_job(update_all_statuses_job, 'interval', minutes=30)
    scheduler.start()

def stop_scheduler():
    scheduler.shutdown()
