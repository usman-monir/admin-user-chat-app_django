from django.shortcuts import render, redirect
from django.contrib.auth.models import Group
from .forms import SignUpForm

# Create your views here.
def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(request.POST.get('password'))
            user.save()
            group = Group.objects.get(name='Customers')
            group.user_set.add(user)
            group.save()
            return redirect('/login/')

    form = SignUpForm()
    return render(request, 'account/signup.html',{'form':form})
