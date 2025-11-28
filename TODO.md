# Implementation TODO

## Phase 1: Core Functionality (4-6 hours)

### 1.1 Prompt Engineering
- [ ] Create `src/prompts/meetingProcessor.js` from `docs/prompts/MEETING-PROCESSOR.md`
- [ ] Test prompt with sample meeting data
- [ ] Validate output format matches schema
- [ ] Handle edge cases (missing data, unclear classification)

### 1.2 Schema Validation
- [ ] Create `src/schemas/webhookPayload.js` using Zod (from `docs/schemas/WEBHOOK-PAYLOAD.md`)
- [ ] Create `src/schemas/outputSchema.js` using Zod (from `docs/schemas/OUTPUT-SCHEMA.md`)
- [ ] Add validation to webhook route
- [ ] Add validation to Claude response

### 1.3 Context Loading
- [ ] Implement `loadContacts()` - read network-contacts files
- [ ] Implement `loadProjects()` - read active-projects files
- [ ] Implement `loadPartners()` - enhance with more data
- [ ] Add caching to avoid repeated file reads
- [ ] Test context loading performance

### 1.4 File Management
- [ ] Implement `createInternalMeetingNote()` using template
- [ ] Implement `createCoachingNote()` using template
- [ ] Implement `updateActionItems()` - append to active-items.md
- [ ] Implement `updateRoadmap()` - append to monthly file
- [ ] Test git operations (commit, push)
- [ ] Handle merge conflicts gracefully

### 1.5 Webhook Processing
- [ ] Implement proper signature verification
- [ ] Wire up all services in `processMeeting()`
- [ ] Add error handling and retries
- [ ] Test with sample webhook payload

---

## Phase 2: Testing & Validation (2-3 hours)

### 2.1 Unit Tests
- [ ] Test webhook signature verification
- [ ] Test schema validation
- [ ] Test prompt generation
- [ ] Test file operations
- [ ] Test context loading

### 2.2 Integration Tests
- [ ] Test full pipeline with sample data
- [ ] Test different meeting types
- [ ] Test error scenarios
- [ ] Test git operations end-to-end

### 2.3 Manual Testing
- [ ] Test with real Fathom webhook (staging)
- [ ] Verify files created correctly
- [ ] Verify action items extracted
- [ ] Verify roadmap additions
- [ ] Verify notifications sent

---

## Phase 3: Polish & Deploy (1-2 hours)

### 3.1 Error Handling
- [ ] Add better error messages
- [ ] Add retry logic for API calls
- [ ] Add fallback for classification failures
- [ ] Add dead letter queue for failed webhooks

### 3.2 Monitoring
- [ ] Add structured logging
- [ ] Add metrics collection
- [ ] Add health check endpoints
- [ ] Add webhook status dashboard

### 3.3 Documentation
- [ ] Update README with actual usage
- [ ] Add troubleshooting guide
- [ ] Add deployment instructions
- [ ] Add webhook configuration screenshots

### 3.4 Deployment
- [ ] Choose hosting (Railway, Render, DigitalOcean)
- [ ] Set up environment variables
- [ ] Configure domain/SSL
- [ ] Test production webhook
- [ ] Monitor first real meetings

---

## Future Enhancements (P2)

### Contact Matching Improvements
- [ ] Fuzzy name matching
- [ ] Email domain matching
- [ ] Title/role extraction
- [ ] LinkedIn profile linking

### Action Item Features
- [ ] Priority assignment algorithm
- [ ] Deadline extraction
- [ ] Owner auto-assignment
- [ ] Integration with task management

### Roadmap Integration
- [ ] P0-P5 priority assignment
- [ ] Revenue impact estimation
- [ ] Dependency detection
- [ ] Timeline estimation

### Notifications
- [ ] Discord integration
- [ ] Email summaries
- [ ] Daily digest
- [ ] Urgent item alerts

### Analytics
- [ ] Meeting frequency by type
- [ ] Action item completion rate
- [ ] Response time metrics
- [ ] Classification accuracy

---

## Current Status

**Last Updated:** 2025-11-27

**Phase:** Skeleton Complete
**Next:** Phase 1.1 - Prompt Engineering

**Blockers:** None
**Notes:** Basic structure in place, ready for implementation

---

## Quick Win Tasks (Start Here)

1. **Implement prompt template** - Copy from docs, test with Claude API
2. **Add webhook schema validation** - Use Zod, validate incoming data
3. **Test with sample data** - Use `docs/examples/sample-internal-meeting.md`
4. **Wire up services** - Connect all pieces in webhook handler
5. **Manual test** - Process one meeting end-to-end

Each of these can be done independently in 30-60 minutes.
