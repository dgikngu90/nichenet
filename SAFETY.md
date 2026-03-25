# Safety & Moderation Guide

SafeNiche is designed from the ground up to be a safe space for all communities. This document outlines the safety features and moderation tools.

## Safety Features

### For Users

#### 1. Content Warnings
- **NSFW Tags**: Posts can be marked as Not Safe For Work. Requires moderator/owner privileges.
  - Adult content is blurred by default
  - Users must explicitly click to view
  - Applies to entire post

- **Spoiler Tags**: Hide plot twists, endings, or sensitive content
  - Content obscured until clicked
  - Can only be added by post author or moderators
  - Cannot be removed once added (to preserve context)

#### 2. Privacy Controls
- **Private Communities**: Invite-only spaces completely hidden from search
  - No public discovery
  - Requires invitation token to join
  - Members only visible to other members

- **User Privacy Settings** (coming soon):
  - Control who can see your online status
  - Control who can mention you
  - Control profile visibility
  - Activity broadcasting toggle

- **Block Users**:
  - Prevents seeing content from blocked users
  - Blocks direct messages
  - Hides comments and posts automatically

#### 3. Reporting System
- Report **Posts**, **Comments**, **Users**, or **Communities**
- Categories:
  - Harassment / Hate Speech
  - Spam / Advertising
  - Inappropriate Content
  - Misinformation
  - Impersonation
  - Self-harm / Suicide
  - Other
- Option to provide detailed description
- Anonymous reporting (report identity hidden from reported user)
- Reporter can track report status

#### 4. Safe Signup
- Email verification required for full posting privileges
- Rate limiting prevents spam
- Optional: CAPTCHA on signup (configurable)
- No passwordless login by default (security)

### For Moderators

#### 1. Moderation Dashboard
- View all reports in the community
- Filter by status (pending/resolved/dismissed)
- Bulk actions on reports
- See reporter details and context

#### 2. Moderation Actions
- **Warn**: Send warning to user with reason
- **Remove Post**: Delete community content
- **Remove Comment**: Delete individual comments
- **Mute**: Temporarily restrict user (configurable duration, default 24h)
- **Ban**: Restrict user from the community
  - Temporary ban (1h, 12h, 24h, 7d, 30d)
  - Permanent ban
  - Must provide reason (visible to banned user)
- **Unban**: Restore user access

#### 3. Moderation Transparency
- **Public Mod Log**: All moderation actions logged and visible to community members (configurable)
  - Action type (ban, remove, etc.)
  - Moderator who took action
  - Reason provided
  - Timestamp
  - Duration (for temporary actions)
- **Appeal Process**: Banned users can submit appeals
  - Reviews by other moderators or admins
  - Transparent resolution

#### 4. Permission Levels
- **Owner**: Full control, can delete community, transfer ownership
- **Moderator**: Can moderate content, manage reports, ban users, remove posts/comments
- **Member**: Can post, comment, vote, report
- **Banned**: No access (can still view public content but cannot interact)

### For Community Owners

#### 1. Community Settings
- **Privacy**:
  - Public: Anyone can view and join
  - Restricted: Anyone can request to join (approval required)
  - Private: Invite-only, hidden from search

- **Approval Settings**:
  - Auto-approve members
  - Manual approval for join requests
  - Requires invitation only

- **Content Control**:
  - Enable/disable NSFW posts
  - Enable/disable spoiler tags
  - Set minimum account age for posting
  - Set posting rate limits per user

#### 2. Rules & Guidelines
- Define community rules in plain text
- Rules displayed prominently on community page
- Must be agreed to upon joining
- Referenceable in moderation actions

#### 3. Invitation System
- Generate invite tokens (email or link)
- Set invite expiration (1 day - permanent)
- Track who sent invites
- Revoke unused invites
- Limit total invites per moderator

### For Platform Admins

#### 1. Global Moderation
- View and act on reports across all communities
- Ban users from entire platform
- Review moderator appeals
- Audit moderation actions
- Configure global safety settings

#### 2. Safety Tools
- Automated spam detection (coming soon)
- AI-powered content moderation (coming soon)
- Rate limiting per IP/user
- Account age restrictions
- Mass user bans for coordinated bad actors

#### 3. Compliance
- Data export/delete for GDPR
- Content removal requests
- Transparency reports
- Legal request handling

## Best Practices for Moderators

1. **Be Transparent**: Always provide a reason for moderation actions
2. **Be Consistent**: Apply rules equally to all members
3. **Be Proportional**: Match punishment severity to violation
4. **Document Actions**: Use mod notes to track patterns
5. **Escalate Appropriately**: Warn before banning for minor first offenses
6. **Follow Due Process**: Give users opportunity to appeal
7. **Don't Abuse Power**: Use moderation tools responsibly
8. **Protect Privacy**: Don't share personal information in public logs
9. **Seek Community Input**: For major decisions, ask members
10. **Take Breaks**: Burnout leads to poor decisions

## Reporting Flow

```
User Reports Content
   ↓
Report Goes to Community Mod Queue
   ↓
Moderator Reviews:
   ├─ Valid → Take Action (Remove/Warn/Ban)
   │            ↓
   │        Record in Mod Log
   │            ↓
   │        Notify Reporter
   │
   └─ Invalid → Dismiss Report
                ↓
            Notify Reporter with reason
```

## Appeal Process

1. Banned/muted user sees reason and duration
2. User can submit appeal via dedicated form
3. Appeal sent to other community moderators + platform appeal team
4. Review within 48 hours (SLA)
5. Decision communicated via notification:
   - Uphold original action
   - Reduce duration
   - Overturn action (unban)
6. Recorded in mod log as appeal outcome

## Emergency Procedures

### Immediate Threats
If a user is threatening violence or self-harm:
1. Report to platform immediately
2. Contact law enforcement if necessary
3. Temporarily ban user pending investigation
4. Preserve evidence (don't delete content)

### Coordinated Attacks
If community is under attack (raiding, spam bots):
1. Enable "restricted" mode (approve all posts)
2. Increase rate limits temporarily
3. Ban offending accounts
4. Report to platform for escalation
5. Consider making community temporary private

## Safety Settings Configuration

Community owners can configure:

```json
{
  "safety": {
    "nsfw_enabled": true,
    "spoiler_tags": true,
    "require_verification": true,
    "min_account_age_hours": 24,
    "post_rate_limit_per_hour": 10,
    "comment_rate_limit_per_hour": 50,
    "require_approval": false,
    "show_mod_log_publicly": true,
    "auto_approve_members": true
  }
}
```

## Contact & Escalation

- **Platform Admin**: admin@safeniche.dev
- **Trust & Safety**: safety@safeniche.dev
- **Legal**: legal@safeniche.dev
- **Emergency**: For imminent threats, contact local authorities first

## Updates

This document is a living document. Safety features and policies may evolve.
Check for updates regularly.

Last updated: 2025-03-24
