# Equipment Checkout System - Admin Guide

## Overview

This guide is for administrators and staff managing the Equipment Checkout System at Catawba College Communication Arts and Media.

## Roles and Permissions

### Admin Role
- Full system access
- Manage users and roles
- Configure system settings
- View all analytics and reports
- Override reservation rules
- Manage categories and tags

### Staff Role
- Approve/reject reservations
- Manage equipment inventory
- Process checkouts and returns
- View analytics (limited)
- Cannot manage users or system settings

### Student Role
- Make reservations
- View own reservations
- Sign digital waivers
- Cannot approve reservations or manage equipment

## User Management

### Adding Users
1. Navigate to "Users" in the admin panel
2. Click "Add User"
3. Fill in user details:
   - Email (must be unique)
   - Name
   - Role (Admin, Staff, or Student)
   - Student/Employee ID
   - Department
   - Phone
4. Set initial password or send invitation email
5. Save user

### Editing User Roles
1. Find user in the user list
2. Click "Edit"
3. Change role as needed
4. Save changes
5. User permissions update immediately

### Deactivating Users
1. Find user in the user list
2. Click "Deactivate"
3. Confirm deactivation
4. User loses access but data is preserved
5. To reactivate, change status back to "Active"

## Equipment Management

### Adding Equipment
1. Navigate to "Equipment" and click "Add Equipment"
2. Fill in equipment details:
   - Name (required)
   - Description
   - SKU (from AssetPanda)
   - Asset ID (internal tracking)
   - Category
   - Location
   - Serial number
   - Purchase date and price
   - Upload images
3. Add tags for better organization
4. Set initial status (usually "Available")
5. Save equipment

### Bulk Import from AssetPanda
1. Export equipment data from AssetPanda as CSV
2. Format CSV with required columns:
   - name
   - sku
   - assetId
   - description (optional)
   - category (must match existing category name)
   - serialNumber (optional)
   - location (optional)
3. Navigate to "Equipment" → "Import"
4. Upload CSV file
5. Map columns to system fields
6. Preview import
7. Execute import
8. Review results and fix any errors

### Updating Equipment
1. Find equipment in the list
2. Click "Edit"
3. Update any fields
4. Change status if needed:
   - **Available**: Ready for checkout
   - **Reserved**: Has active reservation
   - **Checked Out**: Currently with user
   - **Maintenance**: Under repair
   - **Retired**: No longer in service
5. Save changes

### Deleting Equipment
1. Find equipment in the list
2. Click "Delete"
3. System checks for active reservations
4. If active reservations exist, deletion is blocked
5. Cancel or complete active reservations first
6. Confirm deletion

## Reservation Management

### Approving Reservations
1. Navigate to "Reservations"
2. Filter by "Pending" status
3. Review reservation details:
   - Equipment availability
   - Date range validity
   - Purpose description
   - User history
4. Click "Approve" or "Reject"
5. Add notes if rejecting
6. System updates equipment status automatically

### Modifying Reservations
1. Find the reservation
2. Click "Edit"
3. Change dates, purpose, or notes
4. Change status if needed
5. Save changes
6. Equipment status updates accordingly

### Canceling Reservations
1. Find the reservation
2. Click "Cancel"
3. Select reason for cancellation
4. Confirm cancellation
5. Equipment returns to "Available" status
6. User is notified

### Processing Checkouts
1. Navigate to "Reservations" → "Active Checkouts"
2. Find the reservation
3. Click "Check Out"
4. Verify user identity
5. Confirm equipment condition
6. Update status to "Checked Out"
7. Record actual checkout time

### Processing Returns
1. Navigate to "Reservations" → "Due Today" or "Overdue"
2. Find the reservation
3. Click "Check In"
4. Inspect equipment for damage
5. Note any issues
6. Update status to "Checked In"
7. Record actual return time
8. Assess any late fees if applicable

## Digital Waivers

### Waiver Process
1. User makes reservation
2. Reservation is approved
3. User receives notification to sign waiver
4. User signs digitally using mouse/touchscreen
5. PDF is generated automatically
6. PDF is stored and linked to reservation
7. Staff can view/download PDF anytime

### Viewing Waivers
1. Navigate to "Waivers"
2. Filter by date, user, or equipment
3. Click on a waiver to view details
4. Download PDF copy
5. View signature image

### Waiver Compliance
- All checkouts require a signed waiver
- System prevents checkout without signed waiver
- Waivers are stored permanently
- PDFs include:
  - User information
  - Equipment details
  - Checkout period
  - Terms and conditions
  - Digital signature
  - Timestamp

## Analytics and Reporting

### Dashboard Analytics
- Total equipment count and status breakdown
- Active reservations count
- Recent reservation trends
- Top used equipment
- Reservations by category
- Reservations over time

### Custom Reports
1. Navigate to "Analytics"
2. Select date range
3. Choose report type:
   - Equipment usage
   - User activity
   - Revenue (if fees applied)
   - Late returns
   - Damage reports
4. Export as CSV or PDF

### Monitoring System Health
- Check audit logs for suspicious activity
- Review failed login attempts
- Monitor reservation approval times
- Track equipment downtime

## System Configuration

### Reservation Rules
1. Navigate to "Settings" → "Reservation Rules"
2. Configure:
   - Maximum reservation duration (default: 2 nights)
   - Weekend reservation rules (Friday-Monday)
   - Advance booking window (default: 2 weeks)
   - Required waiver signing
   - Auto-approval for staff
3. Save changes
4. Rules apply to new reservations immediately

### Categories and Tags
1. Navigate to "Settings" → "Categories"
2. Add, edit, or delete categories
3. Navigate to "Settings" → "Tags"
4. Add, edit, or delete tags with colors
5. Changes reflect immediately in equipment listings

### Email Notifications
1. Navigate to "Settings" → "Notifications"
2. Configure email templates:
   - Reservation approved
   - Reservation rejected
   - Reminder before return
   - Overdue notice
   - Waiver signing reminder
3. Set email sender address
4. Test email delivery

## Audit Trail

### Viewing Audit Logs
1. Navigate to "Settings" → "Audit Logs"
2. Filter by:
   - Date range
   - User
   - Action type
   - Entity (Equipment, Reservation, User, etc.)
3. View detailed log entries
4. Export logs for compliance

### Audit Log Events
- User creation, update, deletion
- Equipment creation, update, deletion
- Reservation creation, approval, rejection, cancellation
- Waiver signing
- Checkouts and returns
- System configuration changes

## Security Best Practices

### User Accounts
- Enforce strong password policies
- Require email verification
- Monitor for suspicious login patterns
- Regularly review user roles

### Data Protection
- All data encrypted at rest and in transit
- Regular backups configured
- Access logs maintained
- Sensitive data masked in logs

### Equipment Security
- Require photo ID for checkout
- Verify equipment condition before and after use
- Maintain physical inventory records
- Regular equipment audits

## Troubleshooting

### Common Issues

**Users cannot login**
- Check email spelling
- Verify account is active
- Reset password if needed
- Check email verification status

**Equipment shows as unavailable but is physically available**
- Check for active reservations
- Verify equipment status is "Available"
- Clear browser cache
- Check for system errors in logs

**Reservations not approving automatically**
- Check user role permissions
- Verify reservation rules configuration
- Check for database connection issues
- Review error logs

**PDF generation failing**
- Check disk space
- Verify PDF library installation
- Check template files
- Review error logs for specific failures

### Getting Help
- Check system logs in `/var/log/equipment-checkout/`
- Review database connection status
- Test API endpoints manually
- Contact system administrator

## Backup and Recovery

### Backup Schedule
- Daily automated backups at 2:00 AM
- Weekly full backups on Sunday
- Monthly archive to long-term storage

### Backup Contents
- Database dump (PostgreSQL)
- Uploaded files (equipment images, waiver PDFs)
- Configuration files
- Log files

### Recovery Procedure
1. Stop application
2. Restore database from backup
3. Restore file uploads
4. Verify data integrity
5. Restart application
6. Test critical functions

## Compliance and Reporting

### FERPA Compliance
- Student data protected under FERPA
- Access limited to authorized staff
- Data retention policies followed
- Right to access and correction honored

### Financial Reporting
- Equipment value tracking
- Depreciation calculations
- Loss and damage reports
- Insurance documentation

### Audit Requirements
- Maintain audit logs for 7 years
- Regular equipment inventories
- User access reviews quarterly
- Security assessments annually
