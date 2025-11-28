# Gamma Presentation Integration

The Fathom integration now automatically creates a comprehensive Gamma presentation for each meeting processed.

## What Gets Generated

Each meeting creates a multi-slide Gamma presentation with:

### 1. **Title Slide**
- Meeting title
- Date and type
- Meeting context

### 2. **Meeting Summary**
- Executive summary of the meeting
- Key discussion points

### 3. **Key Action Items**
- All action items extracted from the meeting
- Organized by priority and assignee

### 4. **Process & System Updates Required**
- Systems that need to be updated
- Process changes needed
- Technical requirements

### 5. **People & Relationships**
For each person discussed:
- New information learned
- Key insights about them
- Relationship notes
- Business context

### 6. **Additional Discoveries**
- New information uncovered
- Insights gained
- Unexpected findings

### 7. **Automated Processing Summary**
What the Fathom integration did automatically:
- Transcript analyzed by Claude AI
- Information extracted and structured
- Contact records updated
- Action items distributed
- Project files updated
- Presentation generated
- Slack notification sent

### 8. **Next Steps by Person**
- Action items grouped by assignee
- Due dates and priorities
- Clear ownership

### 9. **Meeting Attendees**
- Complete attendee list

## Setup Required

### 1. Get Gamma API Key

1. Go to https://gamma.app
2. Upgrade to Pro account (required for API access)
3. Go to Account Settings → API
4. Create new API key (format: `sk-gamma-xxxxxxxx`)
5. Copy the key

### 2. Add to Environment

Edit `.env`:
```bash
GAMMA_API_KEY=sk-gamma-xxxxxxxx
GAMMA_THEME_ID=Oasis  # or your preferred theme
```

**Available themes:**
- Oasis (default)
- Minimal
- Bold
- Elegant
- Modern
- Create custom themes in Gamma and use their theme ID

### 3. Get Theme IDs (Optional)

To use a custom theme:
```bash
curl https://public-api.gamma.app/v1.0/themes \
  -H "X-API-KEY: sk-gamma-xxxxxxxx"
```

Copy your theme ID to `.env` as `GAMMA_THEME_ID`

## How It Works

1. **Meeting ends** → Fathom webhook triggers
2. **Claude processes** → Extracts structured data
3. **Gamma builds presentation** → Using extracted data
4. **Presentation URL added** → To Slack notification
5. **Team gets link** → In #meeting-summaries channel

## Slack Integration

The Slack notification now includes:
- 🎨 **View Gamma Presentation** button
- Direct link to auto-generated presentation
- Note: "Auto-generated presentation with meeting insights, action items, and next steps"

## Example Workflow

```
[Meeting in Fathom ends]
      ↓
[Webhook sent to integration]
      ↓
[Claude processes transcript]
      ↓
[Gamma creates presentation]
      ↓
[Slack message sent to #meeting-summaries]
      ↓
[Team clicks link to view presentation]
```

## API Costs

- **Included with Gamma Pro** subscription
- No additional API costs
- Generous rate limits (hundreds per hour)

## Files Modified

1. **`.env.example`** - Added Gamma config
2. **`src/utils/config.js`** - Added Gamma settings
3. **`src/services/gamma.js`** - New service (269 lines)
4. **`src/routes/webhook.js`** - Integrated Gamma into pipeline
5. **`src/services/notifier.js`** - Added presentation link to Slack
6. **`package.json`** - Added axios dependency
7. **`README.md`** - Updated workflow and features

## Technical Details

- **API Endpoint:** `https://public-api.gamma.app/v1.0/generations`
- **Authentication:** X-API-KEY header
- **Format:** Presentation (auto-generated from outline)
- **Image generation:** Imagen 4 Pro (photorealistic)
- **Content amount:** Detailed
- **Tone:** Professional, actionable
- **Language:** English

## Presentation Customization

The presentation builder (`src/services/gamma.js`) can be customized:

- **Slide structure** - Modify `buildPresentationContent()`
- **Theme** - Change `GAMMA_THEME_ID` in `.env`
- **Tone** - Edit `textOptions.tone`
- **Detail level** - Adjust `textOptions.amount`
- **Image style** - Change `imageOptions.style`

## Next Steps

1. ✅ Get Gamma Pro account
2. ✅ Generate API key
3. ✅ Add to `.env`
4. ✅ Test with sample meeting
5. ✅ Customize theme if desired
6. ✅ Share with team!
