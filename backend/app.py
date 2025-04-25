# imports:
#       Flask for http server
#       json for converting dictionaries to json
#       sqlite3 for SQLite database connection
from flask import Flask
import json
import sqlite3

# app, database, and database cursor declaration
app = Flask (__name__)
db = sqlite3.connect("main.db")
db_cursor = db.cursor()

# sample user id, to dynamically fetch at login
user_id = 1

# fetches username from database
def user ():
        db_cursor.execute ("SELECT USER FROM user_data WHERE ID = " + str(user_id))
        return db_cursor.fetchone ()[0]

# fetches all expense data from transactions table
def expense_breakdown ():
        db_cursor.execute ('SELECT ACCOUNT FROM transactions WHERE ID = ' + str(user_id) + ' AND TRANSACTION_TYPE = "EXPENSE"')
        temp_names = db_cursor.fetchall ()
        db_cursor.execute ('SELECT AMOUNT FROM transactions WHERE ID = ' + str(user_id) + ' AND TRANSACTION_TYPE = "EXPENSE"')
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
                "User": user (),
                "Net Worth": net_worth (),
                "Balance": balance_total (),
                "Savings": savings_total (),
                "Expenses": expense_total ()
        }

def balance_info ():
        return {
                "User": user (),
                "Balance": balance_total (),
                "Balance Breakdown": balance_breakdown ()
        }

def savings_info ():
        return {
                "User": user (),
                "Savings": savings_total (),
                "Savings Breakdown": savings_breakdown ()
        }

def expense_info ():
        return {
                "User": user (),
                "Expenses": expense_total (),
                "Expense Breakdown": expense_breakdown ()
        }

# conversion of above dictionaries into json, then sending as HTTP response
@app.route  ("/")
def main_page ():
        return json.dumps (summary_info ())

@app.route ("/balance")
def balance ():
        return json.dumps (balance_info ())

@app.route ("/savings")
def savings ():
        return json.dumps (savings_info ())

@app.route  ("/expenses")
def expenses ():
        return json.dumps (expense_info ())
@app.route ("/login", methods="POST")
# takes POST request for user_id and checks against database for validity
def login ():
        if request.method == "POST":
                user_id = request.form("user_id")
                try:
                        db_cursor.execute ("SELECT USER FROM user_data WHERE ID = " + str(user_id))
                        temp_name = db_cursor.fetchone()[0]
                except:
                        return json.dumps ({"ERROR": str(user_id) + " is invalid"})
        else:
                return json.dumps ({"User ID": user_id})

app.run()
