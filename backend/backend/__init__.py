default_app_config = 'reports.apps.ReportsConfig'

from .celery_app import app as celery_app 
__all__ = ('celery_app',)
