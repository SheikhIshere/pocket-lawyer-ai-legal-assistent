from secrets import randbelow

def generate_otp():
    return 100000 + randbelow(900000)