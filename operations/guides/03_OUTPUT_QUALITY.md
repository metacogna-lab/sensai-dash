# Getting Strong Outputs, Not Just Gated Ones

A file passing the gate means it has the right frontmatter and required sections. It says
nothing about whether the theory is sound, the economic model is realistic, or the alignment
document is worth acting on. This guide is about the second thing.

## PASS ≠ true

`/stress-test` classifies every load-bearing claim as grounded, extrapolated, or unsupported, and
issues PASS / PASS-WITH-NOTES / FAIL. Internalize what PASS actually certifies: **consistent with
the corpus as extracted.** The verifier's tools are Read/Grep/Glob over nodes derived from
`pdftotext`/haiku extraction — it cannot independently fact-check against the world. A
hallucination introduced at CONSUME (a mis-extracted PDF passage) is invisible to VERIFY by
construction, because VERIFY checks internal consistency against that same extraction. Two
mitigations, both already in the approved roadmap:

- **The verifier samples original sources**, not just nodes — when stress-testing a claim, spot-
  check it against the archived raw file in `research_body/03_archive/`, not only the node's
  condensed extraction. This breaks the closed loop for at least the claims sampled.
- **Corpus quality is your job, not the pipeline's.** If the source PDFs are wrong, biased, or
  incomplete, every downstream artifact inherits that — no gate catches it. Curate before you
  consume.

## Question sharpness drives everything downstream

`/question`'s output — `goals/research_questions.md` — is the filter every theory, evaluation,
and verification runs through. A vague outcome ("understand market X") produces vague, unfalsifiable
questions, and the analyst has nothing concrete to score a theory against. A sharp outcome
("decide whether X is viable as a standalone product by Q4, given constraint Y") forces the
strategist to produce questions that resolve to supported/contradicted/insufficient-evidence.
Patterns that work:
- State the decision you'll make with the answer, not just the topic.
- Name explicit constraints (budget, timeline, regulatory boundary) — these become the
  `## Constraints` section every downstream verification checks against.
- If you can't tell what "insufficient evidence" would look like for a question, it's not sharp
  enough yet — rewrite it.

## When to re-`/index`

The corpus map (`research_body/corpus_map.md`) is the analyst's cross-document entity index and
as-is baseline. It's a full overwrite on each run, not incremental. Re-run it after any batch of
`/consume` calls that changes the node set materially — a single new node rarely changes the
picture, but five new nodes on a topic the map doesn't yet cover will. Skipping this starves the
analyst's gap analysis: it can only diff against a baseline that's actually current.

## Stress-test cadence

Stress-test every theory and economic model **before** building on it — before `/synthesize`
consumes it, and definitely before `/broadcast` publishes anything derived from it. A FAIL
verdict caught early costs one re-run of the producing phase; caught late (at synthesis or
broadcast) it invalidates everything built on top and you redo more work. The alignment document
itself should also be stress-tested before broadcast — it is not exempt from the self-audit it
sits upstream of.

## Quarantine SLA

A growing `research_body/04_quarantine/` queue is the clearest available signal that a run needs
you, not more corpus. Service conflicts promptly: read both claims, decide, record the resolution,
move the file to `03_archive/`. An unresolved conflict doesn't just sit idle — it's an open risk
that `/synthesize` is required to carry forward into the alignment document rather than silently
dropping, so an unserviced queue directly degrades the quality (and honesty) of the final
deliverable.

## Evaluator honesty: "no viable vector" is a valid answer

The evaluator's job is to force a concrete monetization vector — but "this theory doesn't support
one yet, here's what evidence would change that" is a legitimate, first-class output, not a
failure to try harder. A pipeline that can only ever produce an invented vector is not more
useful than one that's honest about the gap; it's less useful, because it hides the signal that
would tell you to go back and strengthen the theory (or the corpus) instead of shipping a
plausible-sounding but ungrounded economic model.

## A lightweight quality eval (start here, not with a full eval harness)

A full LLM-judge eval suite is deliberately out of scope until the harness has processed real
corpora (see the roadmap's T2 deferral) — you can't calibrate an eval against a system that
hasn't run. In the meantime, a cheap proxy: keep 5-10 fixed question/expected-answer pairs per
engagement (derived from ground truth you already know, e.g. "does the corpus support claim X? —
yes/no/insufficient, and I know the answer is X"). Check the pipeline's actual output against
these pairs during `/daily-summary`. When you have enough real runs to see where the pipeline
systematically over- or under-claims, that's the signal to invest in the full eval harness.
