---
layout: post
title: "Disclosure Game 3"
description: "Job interviews, signalling, and the disclosure game"
category: "disclosure game"
tags: [signalling, game theory, disclosure game, alcohol, midwifery]
---
{% include JB/setup %}

You're recruiting for a software developer position. You interview two people, one of whom claims to be super productive. How do you know if that's actually true? Casting that more generally, somebody is sending you a signal about a secret only they know. What can you tell about their secret from that signal?

Problems of this type are generally known as <a href="http://en.wikipedia.org/wiki/Signaling_game">signalling games</a>, and the particular example with the job interview comes from <a href="http://qje.oxfordjournals.org/content/87/3/355.abstract" title="Job Market Signalling*. The Quarterly Journal of Economics (1973) 87 (3): 355-374">Spence (1973)</a>. Who describes a scenario where the job applicants have a publicly known level of education. Education is, in this instance, the signal, and a high level of education is more costly to obtain if you aren't a very productive person. As it turns out, the costly nature of the signalling can lead to enforcing honest signalling behaviour (assuming pathologically self interested and rational players). The pay from the job is only worth it for high productivity applicants because of the cost of a highly educated signal.

The costly signalling idea is pretty widely useful. Personally, my favourite version is <a href"http://dx.doi.org/10.1016/S0022-5193(05)80088-8" title="Biological signals as handicaps*. Journal of Theoretical Biology 144 (4): 517–546.">Grafen's</a> model of Zahavi's <a href="http://en.wikipedia.org/wiki/Handicap_principle">handicap hypothesis</a>, which uses the idea to explain peacock tails and the like.

Which brings me to what I was talking about originally: the disclosure game.

After some advice from my [supervisor](http://www.southampton.ac.uk/demography/about/staff/jb1d08.page), we decided that while mental health was interesting, something more quantifiable was required. In this case, alcohol consumption. As it turns out, alcohol consumption is actually pretty difficult to measure (particularly in pregnant women). And our usual screening methods have classically consisted of midwives asking women "How many units do you consume in an average week?". But let's set that aside for the minute, we can talk about screening another day.

If you imagine a pregnant lady with a pint of snakebite, you'd probably accept that drinking in pregnancy attracts a bit of negative perception. And in principle, it is something the care team need to know about because of health implications (more on this in a later post). We also know that people aren't necessarily honest about how much they drink, and that heavy drinkers are less honest about it than people who don't drink much (thank you <a href="http://dx.doi.org/10.1111/j.1530-0277.2006.00055.x" title="Alcohol consumption before and during pregnancy comparing concurrent and retrospective reports. Alcoholism: Clinical & Experimental Research, 30(3), pp.510–5.">Alvik et al. (2006)</a>).

On this basis, it doesn't seem wildly out of the blue to fit this into a signalling game like framework. The women know how much they drink, and they get to send a signal. There's a cost benefit situation, because honesty might be <a href="http://dx.doi.org/10.1016/j.tics.2004.05.010" title="Naomi I. Eisenberger, Matthew D. Lieberman, Why rejection hurts: a common neural alarm system for physical and social pain, Trends in Cognitive Sciences, Volume 8, Issue 7, July 2004, Pages 294-300">painful</a>, but for heavy drinkers there might be a cost to keeping quiet. I'm also going to go ahead and assume that babies count as a good thing here.

The usual method when doing this sort of thing in economics, is to work out dollar values for losses and gains. Clearly, we don't want to get into determining the dollar value of having a baby, or losing a baby for that matter. So I'm going to pull some implausible payoffs and losses out of thin air, and also say that we'll have two separate sets of payoffs and losses: health, and social.

When talking the game over, we decided that a few real things probably needed to be abstracted at this point. Real drinking behaviour is really complex and variable. People's consumption varies week to week, and number of units doesn't actually map terribly well to anything. We're ignoring that, and in our abstract world there are only three types of drinker: light, moderate, and heavy. Light drinking is totally fine, won't cause you social or health problems. Moderate drinking leads to slightly worse health outcomes, and heavy drinking has Serious Consequences.

For this to be a game, we need some more players! Let's have them be the midwives, and say that they don't send signals, but can make a move in response to one. In particular, a midwife can refer a patient. We will make another wildly unrealistic assumption at this point, and say that referring a moderate, or heavy drinker *completely cures them*. No negative health consequences.

In the real world, referring a patient to a specialist attracts a cost, and it seems like a good idea to capture that so that the best move isn't to just refer everybody. One would also hope that any physician has a common interest with their patients and wants the best health outcome for them, so let's go ahead and say that the health payoffs and losses are the same for midwives as they are for women.

Social costs. If social cost is sufficiently high, the best move is always to fib. If they're sufficiently low, then light drinkers can say whatever they like. It seems most interesting in this scenario to decide that midwives have types as well, which determine how they respond socially to different signals. Three types, to match the women: non-judgemental, moderately judgemental, and harsh.
Non-judgemental midwives won't punish you socially for anything, moderately judgemental midwives will punish heavy drinkers, and harsh midwives punish moderate drinkers and are particularly vocal about heavy drinkers. This isn't a move on their part, but something intrinsic to their character which can't be helped.

The third player here, is nature, who is responsible for assigning a drinking type, and a judgeyness type to the players.

This gives us a game structure that looks a bit like this:
![Simplified signalling game]({{ site.url }}/assets/images/simple_game_tree.png)

Phew! Next time, I'll talk about the mechanics of actually playing, and the players.
