from django.shortcuts import redirect

def documentation(request):
    return redirect('swagger-ui')