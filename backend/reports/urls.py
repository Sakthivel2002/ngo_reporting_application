from django.urls import path
from . import views

urlpatterns = [
    path('report/', views.submit_report, name='submit_report'),
    path('reports/upload/', views.upload_reports, name='upload_reports'),
    path('job-status/<uuid:job_id>/', views.job_status, name='job_status'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('debug-job/<uuid:job_id>/', views.debug_job_errors, name='debug_job'),
]
