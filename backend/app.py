# imports:
#       Flask for http server
#       json for converting dictionaries to json
#       sqlite3 for SQLite database connection
from flask import Flask
from flask import request
import json
import sqlite3

# app, database, and database cursor declaration
app = Flask (__name__)
db = sqlite3.connect ("main.db", check_same_thread=False)
db_cursor = db.cursor ()

# sample user id, to dynamically fetch at login
user_id = 1
transaction_id = 0

# fetch first and last name from database, respectively
def first_name ():
        db_cursor.execute ("SELECT FIRST_NAME FROM user_data WHERE ID = " + str(user_id))
        return db_cursor.fetchone ()[0]

def last_name ():
        db_cursor.execute ("SELECT LAST_NAME FROM user_data WHERE ID = " + str(user_id))
        return db_cursor.fetchone ()[0]

# fetches all expense data from transactions table
def expense_breakdown ():
        db_cursor.execute ('SELECT ACCOUNT FROM transactions WHERE USER_ID = ' + str(user_id) + ' AND TRANSACTION_TYPE = "EXPENSE"')
        temp_names = db_cursor.fetchall ()
        db_cursor.execute ('SELECT AMOUNT FROM transactions WHERE USER_ID = ' + str(user_id) + ' AND TRANSACTION_TYPE = "EXPENSE"')
        temp_balances = db_cursor.fetchall ()
        return {temp_names[i][0] : temp_balances[i][0] for i in range(temp_names.__len__ ())}


# fetches all checking balance data from accounts table
def balance_breakdown ():
        db_cursor.execute ('SELECT ACCOUNT FROM accounts WHERE ID = ' + str(user_id) + ' AND ACCOUNT_TYPE = "CHECKING"')
        temp_names = db_cursor.fetchall ()
        db_cursor.execute ('SELECT BALANCE FROM accounts WHERE ID = ' + str(user_id) + ' AND ACCOUNT_TYPE = "CHECKING"')
        temp_balances = db_cursor.fetchall ()
        return {temp_names[i][0] : temp_balances[i][0] for i in range(temp_names.__len__ ())}

# fetches all savings balance data from accounts table
def savings_breakdown ():
        db_cursor.execute ('SELECT ACCOUNT FROM accounts WHERE ID = ' + str(user_id) + ' AND ACCOUNT_TYPE = "SAVINGS"')
        temp_names = db_cursor.fetchall ()
        db_cursor.execute ('SELECT BALANCE FROM accounts WHERE ID = ' + str(user_id) + ' AND ACCOUNT_TYPE = "SAVINGS"')
        temp_balances = db_cursor.fetchall ()
        return {temp_names[i][0] : temp_balances[i][0] for i in range(temp_names.__len__ ())}

# calculated data points
def expense_total ():
        return sum (expense_breakdown ()[item] for item in expense_breakdown ())
def balance_total ():
        return sum (balance_breakdown ()[item] for item in balance_breakdown ())
def savings_total ():
        return sum (savings_breakdown ()[item] for item in savings_breakdown ())
def net_worth ():
        return balance_total () + savings_total () - expense_total ()

# conversion of data points to dictionaries, to be converted to json when requested
def summary_info ():
        return {
                "First Name": first_name (),
                "Last Name": last_name (),
                "Net Worth": net_worth (),
                "Balance": balance_total (),
                "Savings": savings_total (),
                "Expenses": expense_total ()
        }

def balance_info ():
        return {
                "First Name": first_name (),
                "Last Name": last_name (),
                "Balance": balance_total (),
                "Balance Breakdown": balance_breakdown ()
        }

def savings_info ():
        return {
                "First Name": first_name (),
                "Last Name": last_name (),
                "Savings": savings_total (),
                "Savings Breakdown": savings_breakdown ()
        }

def expense_info ():
        return {
                "First Name": first_name (),
                "Last Name": last_name (),
                "Expenses": expense_total (),
                "Expense Breakdown": expense_breakdown ()
        }

# conversion of above dictionaries into json, then sending as HTTP response

# also transforming forms into database inserts
@app.route  ("/")
def main_page ():
        return json.dumps (summary_info ())

@app.route ("/balance", methods=["POST", "GET"])
def balance ():
        if request.method == "POST":
                db_cursor.execute ("""INSERT INTO transactions (USER_ID, TRANSACTION_ID, ACCOUNT, TRANSACTION_TYPE, TRANSACTION_DATE, AMOUNT)
                                        VALUES (""" + str (user_id) + ', ' + str (transaction_id) + ', "' + request.form ['bank'] + '", "DEPOSIT_CHECKING", ' + 
                                        request.form ['date'] + ', ' + str (request.form ['amount']) + ');')
                db.commit ()
                
                db_cursor.execute ('SELECT AMOUNT FROM accounts WHERE ID = ' + str(user_id) +
                                        ' AND ACCOUNT_TYPE = "CHECKING" AND ACCOUNT = "' + request.form ['bank'] + '"')
                value = db_cursor.fetchone[0] + request.form ['amount']

                db_cursor.execute ("""UPDATE accounts
                                        SET AMOUNT = """ + str (value) + 'WHERE ID = ' + str (user_id) +
                                        ' AND ACCOUNT_TYPE = "CHECKING" AND ACCOUNT = "' + request.form ['bank'] + '"')
                db.commit ()
        else:
                return json.dumps (balance_info ())

@app.route ("/savings", methods=["POST", "GET"])
def savings ():
        if request.method == "POST":
                db_cursor.execute ("""INSERT INTO transactions (USER_ID, TRANSACTION_ID, ACCOUNT, TRANSACTION_TYPE, TRANSACTION_DATE, AMOUNT)
                                        VALUES (""" + str (user_id) + ', ' + str (transaction_id) + ', "' + request.form ['bank'] + '", "DEPOSIT_SAVINGS", ' + 
                                        request.form ['date'] + ', ' + str (request.form ['amount']) + ');')
                db.commit ()

                db_cursor.execute ('SELECT AMOUNT FROM accounts WHERE ID = ' + str(user_id) +
                                        ' AND ACCOUNT_TYPE = "SAVINGS" AND ACCOUNT = "' + request.form ['bank'] + '"')
                value = db_cursor.fetchone[0] + request.form ['amount']

                db_cursor.execute ("""UPDATE accounts
                                        SET AMOUNT = """ + str (value) + 'WHERE ID = ' + str (user_id) +
                                        ' AND ACCOUNT_TYPE = "SAVINGS" AND ACCOUNT = "' + request.form ['bank'] + '"')
                db.commit ()

                transaction_id += 1
        else:
                return json.dumps (savings_info ())

@app.route  ("/expenses", methods=["POST", "GET"])
def expenses ():
        if request.method == "POST":
                db_cursor.execute ("""INSERT INTO transactions (USER_ID, TRANSACTION_ID, ACCOUNT, TRANSACTION_TYPE, TRANSACTION_CATEGORY, TRANSACTION_DATE, AMOUNT)
                                        VALUES (""" + str (user_id) + ', ' + str (transaction_id) + ', "' + request.form ['company'] + '", "' + request.form ['category' ]
                                        + '", "EXPENSE", ' + request.form ['date'] + ', ' + str (request.form ['amount']) + ');')
                db.commit ()
                transaction_id += 1
        else:
                return json.dumps (expense_info ())

# deletes items from database
@app.route ("/delete", methods=["POST"])


@app.route ("/login", methods=["POST"])
# takes POST request for user_id and checks against database for validity
def login ():
        if request.method == "POST":
                global user_id
                user_id = request.form ["user_id"]
                try:
                        db_cursor.execute ("SELECT FIRST_NAME FROM user_data WHERE ID = " + str (user_id))
                        temp_name = db_cursor.fetchone()[0]
                        return "OK"
                except:
                        return json.dumps ({"ERROR": str (user_id) + " is invalid"})
        else:
                return json.dumps ({"User ID": user_id})

@app.route ("/register", methods=["POST"])
# takes user's name and phone number as username and user id
def register ():
        if request.method == "POST":
                db_cursor.execute ("""INSERT INTO user_data (ID, FIRST_NAME, LAST_NAME, TRANSACTIONS_ID, ACCOUNTS_ID)
                                        VALUES (""" + str (request.form ["user_id"]) + ', "' + request.form ["first_name"] + '", "'
                                         + request.form ["last_name"] + '", ' + str(request.form ["user_id"]) + ', '
                                         + str (request.form ["user_id"]) + ');')
                db.commit ()
                return "OK"


app.run()
