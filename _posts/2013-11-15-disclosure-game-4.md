---
layout: post
title: "Disclosure Game 4"
description: ""
category: "disclosure game"
tags: [agents, bayes]
---
{% include JB/setup %}
Last time, I finally mentioned the disclosure game and said it looked like this: ![Simplified signalling game]({{ site.url }}/assets/images/simple_game_tree.png)

(I've described it in terms of midwives, and pregnant women who may or may not have a drinking problem. But I think the structure is more general than that, and can be applied in a lot of scenarios where there's some degree of common interest to revealing information.)
In this post, I'm going to talk about simulating the game.

Now the game needs some players. In this case, we're going to use some fairly simple agents, and a population of them. We are not, in this instance, particularly interested in finding the equilibrium of the game. Instead we're interested in how the strategy of the players changes over time, as they play against each other.  The reason I've focused on this, is that much of the qualitative literature from midwifery research emphasises that people need to build up a relationship with their midwife before disclosing things like alcoholism, or drug abuse <sup><a href="http://dro.deakin.edu.au/eserv/DU:30007322/phillips-factorsthatinfluence-2007.pdf" title="Phillips, D. et al., 2007. Factors that Influence Women’s Disclosures of Substance Use During Pregnancy: A Qualitative Study of Ten Midwives and Ten Pregnant Women. The Journal of Drug Issues, 37(2), pp.357-376.">1</a></sup>.

In our first version of the game, we take a population of midwives, and a larger one of women (the ratio is arbitrarily 10:1, but varies hugely across the real NHS), and have each woman play 100 rounds of the game, against 100 randomly chosen midwives. After a round of the game, both players get their payoff, and learn the true type of the other.

So, we need some sort of learning agent, because we would like the strategies to adapt based on the agent's experience of playing. Ideally, the learning should be as computationally tractable as possible, so we can have a large population of agents and have a simulation run in a sensible amount of time. This immediately suggests that something like <a href="http://en.wikipedia.org/wiki/Bayesian_inference">Bayesian inference</a> is required, which in the right circumstances can be a very fast learning method.

But what exactly are these agents learning? First, the midwives. Their experience of the game is that they receive a signal, and need to work out which type of woman sent it so they can take appropriate action. On this basis then, a good first crack at this would be to decide that they are learning about the meaning of signals. Does a light drinker signal actually mean "I'm a heavy drinker."? We can then have a set of beliefs about each signal's meaning, so a midwife believes that there is some degree of likelihood that a low signal means each type. (Note that this allows for a scenario where all signals actually mean the same type.)

Women have a slightly more complicated situation - they don't get a signal, but have to make a guess about the type of the opponent they are facing based only on their experiences so far. They then need another bit of information that balances against this: how likely am I to get referred if I send this signal? If you think of the referral-signal problem as being 'how confident am I that signal implies response', then this is very similar to the midwives' problem, and can be dealt with by a similar structure.
Working out the likely type of your next opponent is a sampling with replacement problem - if I have an urn fall of coloured balls, and I keep pulling a ball out, noting the colour, then dropping it back in, how do I work out how what the distribution of colours is? So this is a simple kind of belief, about how prevalent each type is in the world.

A little more detail. To perform our various bits of inference, we need a prior probability distribution to form the basis of the beliefs. Happily, all the things we're concerned with here split up into categories - a signal implies a type, not somewhere between them. This means there is a very convenient type of prior that can be used, the <a href="http://en.wikipedia.org/wiki/Dirichlet-multinomial_distribution">Dirichlet distribution</a>, which makes the inference process very each indeed.

The actual distribution function looks beastly (speaking as a rubbish mathematician) - \\(D(\Theta|\alpha)=\frac{\Gamma(\sum_{i=1}^{k}\alpha_{i})}{\prod_{i=1}^{k}\Gamma(\alpha_{i})}\overset{k}{\underset{i=1}{\prod}\Theta_{i}^{\alpha_{i-1}}}\\)

But in actual practical use is very simple. the \alpha values are psuedo-counts, so taking the women's midwife type problem, they represent the number of times that each type has been observed. A woman with a particularly strong prior belief that all midwives are charming and non-judgemental, might have a very high \\(\alpha\\) value for the non-judgemental type, and zeros for the other two, for example. The prior probability of a type is then that type's \\(alpha\\) divided by the sum of all the \\(alpha\\) values for all types.

When it comes to updating these beliefs, the formula can be transformed into the substantially less distressing \\(P(x=j|D,\alpha)=\frac{\alpha_{j}+n_{j}}{\sum_{j}(\alpha_{j}+n_{j})}\\), where \\(n\\) is the number of observations of a type.

An example, let the psuedo-counts, \\(\alpha\\) be {10, 1, 1}. That's 10 for non-judgemental, and 1 for each of the other two. The prior belief that next randomly drawn midwife is going to be a harsh one is then \\(P(harsh)=\frac{1}{10 + 1 + 1}=\frac{1}{12}\\).

The next midwife is drawn, and is actually a moderate one. So, \\(n={0, 1, 0}\\). This changed the balance of probability for the harsh midwife, which becomes \\(P(harsh)=\frac{1 + 0}{(10 + 1 + 1) + (0 + 0 + 1)}=\frac{1}{12 + 1}=\frac{1}{13}\\). The likelihood of a non-judgemental midwife is similarly diminished.

The same principle can be applied to reasoning about the implications of signals, by counting the number of times that a response followed a signal, or a signal was sent by a type. (These are the \\(\alpha\\) and \\(n\\).)

This gives us probabilities which can be used for reasoning. Women's beliefs about the distribution of midwife types should, given time, approach the true distribution. Beliefs about referrals, and the meaning of signals may have no static distribution to converge to, and make the overall system unstable. Which is actually what we want!

There's a whole lot of words here, so I will leave what the agents actually do with their beliefs to another post.