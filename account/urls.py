from django.contrib.auth.views import LoginView, LogoutView
from django.urls import path

from .forms import LoginForm
from . import views

app_name = 'account'


urlpatterns = [
    path('signup/', view=views.signup, name='signup'),
    path('login/', LoginView.as_view(template_name='account/login.html', form_class=LoginForm), name='login'),
    path('logout/', LogoutView.as_view(), name='logout')
]
