# Copy Checker Memory — Raduna

## Terminology Standard (decided: pending Oleg approval, 2026-02-12)
- **EN:** "memorial" for the digital page, "grave" only for physical site (map pin, care services)
- **RU:** "мемориал" for the digital page, "могила" only for physical site
- **NEVER use:** "захоронение" (bureaucratic) in user-facing copy
- Consistency is the #1 issue found in the first review

## i18n File Locations
- EN: `/Users/olegkrook/development/pamyat/i18n/en.json`
- RU: `/Users/olegkrook/development/pamyat/i18n/ru.json`
- ~169 lines each, flat JSON with nested sections

## Tone Guidelines (from agent definition)
- Warm, not sentimental. Direct, not clinical.
- No euphemisms that confuse ("passed away" OK, "transitioned" not)
- No religious assumptions in default copy (Orthodox features opt-in)
- Delete confirmations should describe consequence, not ask "Are you sure?"

## RU Copy Pitfalls
- "Очистить кладбище" = "clean the cemetery" (should be "сбросить выбор")
- "Управлять мемориалом" sounds bureaucratic — use softer verbs
- "Заказать уход" implies existing transaction — careful with waitlist copy
- "Человек" as a step label is too generic — use "О ком" or contextual label
- RU runs ~20-30% longer — watch button/tab labels

## App Store Metadata (drafted 2026-02-12, pending approval)
- Subtitle: EN "Memorial Pages for Families" / RU "Мемориалы вашей семьи"
- Support email placeholder: hello@raduna.app (needs confirmation)
- Keywords optimized for bilingual diaspora search patterns
