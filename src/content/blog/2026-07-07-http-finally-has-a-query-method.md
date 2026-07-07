---
title: 'HTTP Finally Has a QUERY Method'
description: 'RFC 10008 standardizes QUERY: a request that is safe and idempotent like GET, but carries a body like POST. Here is why that matters and which issue I still see.'
date: 2026-07-07
tags: ['http', 'web', 'api-design']
draft: false
---

For as long as I have been building web applications, there has been an awkward gap in HTTP.
You want to retrieve data and have a complicated set of filters to describe what you want.
And you have exactly two bad options for expressing it: `GET` or `POST`.
As of [RFC 10008](https://www.rfc-editor.org/info/rfc10008/), there is finally a third, better one: the **QUERY** method.

## The problem that exists since forever

Say you are building a search endpoint.
The client needs to send a rich filter: nested conditions, a list of fields to return, sorting, pagination.
Historically you pick `GET` or `POST`, and both are wrong in their own way.

**Option one: GET with a query string.** This is the _correct_ choice semantically, because a search is a read.
`GET` is safe (it does not change state) and idempotent (repeating it is harmless), so caches, proxies, and browsers all know they can cache it, retry it, and generally treat it as harmless.
The trouble is that your filter has to fit in the URL.
Complex filters stop fitting in a URL surprisingly fast, URL length limits vary across servers and proxies, and everything you put there leaks into access logs, browser history, and referrer headers.
You also cannot put a real body on a `GET`.
RFC 9110 is explicit that content on a `GET` request has no defined semantics, and plenty of servers and intermediaries will strip or reject it.

**Option two: POST the filter as a body.** Now your filter fits comfortably and stays out of the URL.
But you have just lied about what your request does.
`POST` is defined as neither safe nor idempotent, so every layer between your client and your server now assumes this request might change something.
Caches will not cache the response (hopefully...).
A proxy will not transparently retry it.
The browser throws up a _confirm resubmission_ dialog if someone hits refresh.
Your observability and security tooling files it under _writes_.
You are doing a read, but the semantically it as a write, and you lose every optimization that safety and idempotence would have unlocked.

This is the issue millions of APIs have been driving around for decades.
Elasticsearch, GraphQL over `POST`, and countless internal search endpoints all reach for `POST` because the body is non-negotiable, and then quietly give up caching and safe retries as the price.

## What QUERY does

`QUERY` is the missing combination: **a method that is safe and idempotent like `GET`, but carries a request body like `POST`.**
That is the whole idea, and I love it.

Here is the example straight from the RFC:

```http
QUERY /contacts HTTP/1.1
Host: robinreinecke.de
Content-Type: application/x-www-form-urlencoded
Accept: application/json

select=surname,givenname,email&limit=10&match=%22email=*@example.*%22
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"surname": "Smith", "givenname": "John", "email": "smith@example.org"}, ...]
```

Because the semantics are the body, you are not limited to form encoding.
A modern JSON search request looks exactly how you always wished it could:

```http
QUERY /orders HTTP/1.1
Host: robinreinecke.de
Content-Type: application/json
Accept: application/json

{
  "filter": {
    "status": ["shipped", "delivered"],
    "createdAfter": "2026-01-01",
    "total": { "gte": 100 }
  },
  "fields": ["id", "status", "total"],
  "sort": [{ "createdAt": "desc" }],
  "limit": 50
}
```

The request declares its own intent honestly.
A cache is allowed to store the response, as long as it folds the request body into the cache key (the spec requires this, and permits normalizing
insignificant differences like whitespace in the JSON).
A proxy is allowed to retry it.
A `Content-Type` is mandatory, which is a nice touch, because the body is the query and the server needs to know how to read it.

## What's the issue now?

I am genuinely happy about this, but I would not rewrite my search endpoints immediately, and here is why.

A brand new HTTP method is only as useful as the number of things between your client and your server that understand it.
CDNs, load balancers, corporate proxies (we all love them), web application firewalls (WAF), API gateways, and older HTTP client libraries frequently reject or mangle methods they do not recognize, which is a good thing for security.
A WAF that has never heard of `QUERY` may simply block it.
`PATCH` was standardized in 2010 and still took years to become something you could rely on everywhere.
`QUERY` will follow the same long adoption curve.

The headline benefit is cacheable reads with a body, but that requires caches to key on the request body, and most HTTP caches today key on method plus URL and nothing else.
Body-aware cache keys are not trivial, and until your CDN actually supports them, you get the honesty of `QUERY` without the caching payoff you adopted it for.

The spec says `QUERY` is safe and idempotent, but nothing forces your handler to behave that way, exactly like nothing stops someone from writing a `GET` that mutates a database (I've seen that too often...).
The contract only helps if implementers honor it.
So please spread the word.

Security tooling encodes assumptions about which methods do what.
Until firewall rules, request-smuggling defenses, and cache-poisoning protections account for `QUERY` and its body-in-the-cache-key behavior, there is a window where the tooling is behind the spec.
That is not a reason to avoid `QUERY`, but it is a reason to roll it out deliberately.

## Conclusion

`QUERY` is the correct fix to a problem we all learned to live with, and standardization is exactly the milestone that starts the clock on real adoption.

The best part is not that I can use it everywhere tomorrow.
It is that "why is this endpoint not a `GET`?" is finally over.
