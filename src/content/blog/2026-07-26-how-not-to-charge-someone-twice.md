---
title: 'How Not to Charge Someone Twice'
description: 'Retries are the only sane response to an unreliable network. Idempotency keys are what make them safe. Notes from working on payment systems.'
date: 2026-07-26
tags: ['api-design', 'http', 'payments']
draft: false
---

Somewhere between your client and your server, a request died.
Maybe it never arrived.
Maybe it arrived, did its work, and the response got lost on the way back.
From the outside these two cases look identical, and that is the whole problem.

If the request was "load my dashboard", nobody cares.
You retry.
If the request was "transfer 500 euros", the difference between "never happened" and "happened, but you never heard back" is exactly the kind of thing that ends up in an incident review.

## Retrying is not optional

The tempting answer is to simply not retry anything that moves money.
That does not survive contact with reality.
Mobile clients lose connectivity mid-request.
Load balancers time out.
Deployments kill connections at the worst possible moment.

And if your answer to a lost response is "show the user an error and hope for the best", the user will press the button again.
Now the retry still happens, just without any of the safety you could have built around it.

So retries have to be safe.
Which means the operation has to be idempotent: doing it twice must have the same effect as doing it once.

## The key

The standard tool for this is an idempotency key.
The client generates a unique value per logical operation (a UUID is fine) and sends it along:

```http
POST /payments HTTP/1.1
Content-Type: application/json
Idempotency-Key: 07f4c9e1-4b2a-4f6e-9c1d-8a5b3d2e1f00
```

On the server, the logic is short to describe.
If you have never seen the key, process the request and store the response under that key.
If you have seen it, return the stored response and process nothing.
The client can now retry as often as it likes and the money moves once.

## The parts people get wrong

The concept is simple.
The edge cases are where the fun is.

If you only remember "handled" and not the response, the retry gets back an empty 200 or a duplicate error, and the client still does not know what actually happened.
Returning the original response makes the retry indistinguishable from the first attempt, which is the entire point.

We all love race conditions.
A double-click sends the same key twice within milliseconds, and both requests pass the "have I seen this key" check before either has written anything.
A read-then-act check has a race window exactly where you least want one.
Let the database do the work with a unique constraint on the key, and give the loser of that race either the stored result or a clear "still processing" response.

What should happen if the same key is used with a different body?
That is a client bug, and silently answering with the stored response of a different request hides it.

Keys shouldn't live forever.
Pick a retention window, document it, done.

## Build it in from day one

None of this is exotic.
Stripe has shipped it for over a decade, and there is even an IETF draft for a standard `Idempotency-Key` header.
Yet I keep running into internal APIs where the retry story is "should be fine".

It is one of those features nobody notices when it exists and everybody notices when it does not.
If your API moves money, or anything else you would not want twice, build it in from day one.
Retrofitting it after the first double booking is a much worse afternoon.
