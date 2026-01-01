# Community Book Sharing Platform
        
Ready to proceed. 
The web app has the following tables and fields:
User:
- full_name, email, google_id, avatar_url
- province, district
- role, admin_role
- is_trusted_member, is_active
- joined_at, last_login_at

Activity:
- title, description, start_time, end_time, location
- max_participants
- status
- checkin_enabled
- created_by_admin
- created_at

ActivityRegistration:
- activity
- user
- registered_at

ActivityAttendance:
- activity
- user
- checkin_method
- checkin_at

FeedbackTopic:
- name, is_active

ActivityFeedback:
- activity
- user
- original_topic
- display_topic
- rating
- comment, is_anonymous
- ai_suggested, ai_flagged, ai_reason
- is_published, published_at, created_at

Book:
- title, author, category, cover_url
- owner
- owner_phone_masked
- province, district
- status
- created_at

BorrowRecord:
- book
- borrower
- status
- borrower_confirmed, owner_confirmed
- completion_note, completed_at

Notification:
- user
- title, message, link
- channel
- is_read, created_at

AuditLog:
- actor
- action, target_type, target_id, note, created_at 
Do not auto-publish or auto-punish with AI. 
Tables and fields should be created exactly as specified. 
Wait for review confirmation after each step.

Made with Floot.

# Instructions

For security reasons, the `env.json` file is not pre-populated — you will need to generate or retrieve the values yourself.  

For **JWT secrets**, generate a value with:  

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then paste the generated value into the appropriate field.  

For the **Floot Database**, download your database content as a pg_dump from the cog icon in the database view (right pane -> data -> floot data base -> cog icon on the left of the name), upload it to your own PostgreSQL database, and then fill in the connection string value.  

**Note:** Floot OAuth will not work in self-hosted environments.  

For other external services, retrieve your API keys and fill in the corresponding values.  

Once everything is configured, you can build and start the service with:  

```
npm install -g pnpm
pnpm install
pnpm vite build
pnpm tsx server.ts
```
