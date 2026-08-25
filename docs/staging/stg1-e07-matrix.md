# STG-1 E07 access and containment matrix

This matrix is executable only against Vercel Preview alias
`https://haderech-preview.vercel.app`, Convex Development deployment
`content-dog-757`, Clerk Development, and fixture version `stg1-v1`. It does not
authorize Production, real users, real payment fulfilment or a real AI provider.

## Identity-level expectations

| Identity | Browser account | Community | Course lessons | Simulator | Admin | Privacy |
| --- | --- | --- | --- | --- | --- | --- |
| `ANON` | none | safe preparing status; topics denied | denied | authentication required | denied | export denied |
| `U0` | synthetic | denied | denied | trial, 5 remaining | denied | self only |
| `A` | synthetic | allowed | denied | trial, 5 remaining | denied | self only |
| `B` | synthetic | allowed | denied | trial, 5 remaining | denied | self only |
| `E` | synthetic | denied | 76 lessons, including optional `5.3.2` | entitled/full | denied | self only |
| `X` | synthetic | denied; expired course grant gives no community right | denied | trial, 5 remaining | denied | self only |
| `ADMIN` | synthetic | allowed | 76 lessons, including optional `5.3.2` | admin/full | allowed | self plus authorized admin lookup |
| `IMPOSTOR` | synthetic | denied | denied | trial, 5 remaining | denied | self only; foreign existing and missing IDs return the same denial class |

Every authenticated row must also prove all of the following:

- one-use Clerk ticket sign-in completes in the browser;
- `/dashboard` remains authenticated;
- the browser opens exactly one Convex host and it is
  `content-dog-757.convex.cloud`;
- Clerk issues a Convex JWT;
- `users.getMe` resolves to the exact local provider binding and expected role;
- exported data contains the caller's binding and no other fixture identity.

## Cross-cutting checks

The E07 runner records stable check IDs for:

- Vercel response-header read-back and a Clerk Development frontend instance;
- anonymous redirect and anonymous API denials;
- student-negative and admin-positive browser routes;
- community allow/deny policy for all seven identities;
- simulator trial, entitlement and admin branches;
- course active, expired, missing and admin branches;
- self-only privacy, an indistinguishable impostor denial and authorized admin
  cross-user lookup;
- empty subscription/payment read models for every fixture account;
- checkout fail-closed before any payment-provider call;
- zero admin payment/subscription/revenue counts;
- fixed `503 payment_fulfillment_unavailable` containment for both webhook GET
  and POST.

## Side-effect and evidence constraints

E07 may create only seven short-lived Clerk sign-in tickets and the browser
sessions produced from them. It does not create progress, community content,
simulator messages, payments, subscriptions or provider checkout sessions. The
report must state `persistentDataWritesByMatrix: 0`, `paymentProviderCalls: 0`
and `realAiProviderCalls: 0`.

The runner closes all browser contexts. E08 then revokes the exact four fixture
entitlements, demotes only `ADMIN`, proves the disposable Convex writer absent
after base-tree restoration, and bans the exact seven Clerk accounts. E09 rolls
back optional lesson `5.3.2` and requires a same-version re-preview to fail
closed.
