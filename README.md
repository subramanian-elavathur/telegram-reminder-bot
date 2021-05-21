# telegram-reminder-bot

Telegram Reminder Bot

To start server execute `npm start`

## Notes

1. A recurrence rule shall be valid for no longer than 1 year
2. When a recurring reminder is specified - entries will be added to the reminder log with timstamp, message, and chat id
3. A process shall run every minute and check the log and send reminders for all entries that match the epoch timestamp
4.
