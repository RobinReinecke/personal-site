# Blog writing style

These rules apply to every blog post under [src/content/blog/](../src/content/blog/).
The goal is a real, professional tech blogger voice.
Not the polished LinkedIn AI cringe, and not a school essay.
This doc is written the way posts should read, so use it as a reference for the tone.

Never use em dashes.
Not one.
If you reach for a break in a sentence, use a comma, a full stop, or rewrite the sentence so it does not need the break.
This is the single hardest rule and the easiest one to check for, so check.

Put a line break after every sentence, at the full stop, not in the middle of one.
One sentence per line.
Markdown collapses these breaks into a normal paragraph when it renders, so the page looks exactly the same, but the source is far easier to read and the diffs only show the sentences that actually changed instead of reflowing a whole paragraph.
Do not hard-wrap in the middle of a sentence to hit some column width.

Write for a smart reader who does not have English as a first language.
Plain words beat rare ones every time.
"use" over "utilize", "start" over "commence", "help" over "facilitate", "about" over "regarding".
If a word would send a fluent-but-non-native reader to a dictionary, pick a simpler one.
Short, clear sentences read as confident, not dumb.

Prefer prose and real code over structure.
A post is paragraphs that flow into each other, not a deck of bullet points with headings every three lines.
Use a heading when the topic genuinely turns, not to chop text into scannable chunks.
Lists are for things that are actually a list (steps, options, config keys), never as a way to avoid writing sentences.
When you explain how something works, show the code and talk through it in prose.

Never write the AI pattern where a bold lead-in restates the point and then a sentence explains it, like "**Caching is important.** It saves you round trips to the database."
Just make the point once, in a normal sentence.
If you catch yourself writing a bold label followed by a colon or a restated explanation, delete the label.

Kill the AI tells.
No "In today's fast-paced world", "It's worth noting that", "Let's dive in", "At the end of the day", "In conclusion", or "I hope this helps".
Ban the vocabulary that screams generated text: delve, leverage, robust, seamless, elevate, unlock, harness, testament, landscape, game-changer, boasts, realm.
Drop the rule-of-three rhythm ("fast, reliable, and scalable") and the "it's not just X, it's Y" construction.
Do not open every post with a grand hook or close it with a call to action asking for comments.

Be specific and opinionated.
Real numbers, real error messages, real file names, real trade-offs you hit.
"The build dropped from 40s to 6s" lands.
"Significantly faster build times" does not.
Say what you actually think, including when a tool annoyed you.
A blog is allowed to have a point of view.

Bring humor, but keep it dry and low-key.
An aside, an honest aside about the bug that ate an afternoon, a well-placed understatement.
Not exclamation marks, not a joke wearing a sign that says "this is a joke".
If you have to explain it, cut it.

Internet culture and memes are fine in small doses when they fit naturally.
A reference the audience will get, dropped without ceremony, is good.
A forced meme that needs a setup is worse than none.
When in doubt, leave it out.

Emojis only when they are genuinely part of the content, for example showing what a UI actually renders, or a shrug in a sentence where it earns its place.
No decorative emoji headers, no ✅/🚀 bullet garnish, no emoji as punctuation.

A few more habits.
Contractions are good, they sound human.
Vary sentence length so the rhythm is not flat.
Cut filler and hedging ("basically", "essentially", "in order to", "the fact that").
Link to real sources instead of vaguely gesturing at them.
Keep titles plain and honest, no clickbait and no "colon: the listicle" formatting.
Read the draft out loud in your head.
If it sounds like a person who builds things and has opinions, ship it.
If it sounds like a press release, start over.
