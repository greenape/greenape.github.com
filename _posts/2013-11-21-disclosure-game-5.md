---
layout: post
title: "Leuven Abstract"
description: ""
category: "disclosure game"
tags: [disclosure game, agents, abstract, tex, pandoc]
---
{% include JB/setup %}
This is as much as anything else an experiment with [Pandoc](http://johnmacfarlane.net/pandoc/), because I originally wrote this in TeX. Here follows an extended abstract on the disclosure game, or more generally on decision theoretic agents as a nice approach to agent modelling.


Introduction
============

In this extended abstract we examine the feasibility of Bayesian games played by populations of decision theoretic agents as an approach to agent based modelling. This is explored through a case study focusing on the disclosure of drinking behaviour by pregnant women to their midwives. While the question of safe levels of alcohol consumption is a significant one, the interest in this particular problem is as an example of a question more generally relevant to population health: Why would anybody lie to their doctor?

Much of the appeal of agent based modelling as a technique in population sciences and beyond is the perception that it is better able to capture the causal structure of interactions in the real world than more abstract approaches. The use of simulated individuals to iteratively explore the dynamics of a system offers the attractive prospect of facilitating prediction at the aggregate scale, based on limited and concrete assumptions made on a local scale. Potentially this offers a compelling feedback between the two, in that models which are capable of adequately capturing individual behaviour should be able to offer an explanation of large scale system behaviour. However, this also highlights a significant unease about , in that they are often ad hoc in their models of individuals and interactions, and based on intuition about how individuals act and interact, rather than a well supported theoretical basis (Waldherr and Wijermans 2013). It is this concern that motivates the focus on behavioural rules apparent in this work.

This extended abstract proceeds to outline the approach to agents as decision theoretic in section [2](#dec_theory), followed by an account of the case study in section [3](#case). Section [4](#results) provides a discussion of selected results from the model, and finally section [5](#conc) contains conclusions and a brief description of the current focus of work.

Decision Theoretic Agents {#dec_theory}
=========================

Theories of decision making can be classified into two broad groups - descriptive, and normative, mirroring the positive vs. normative dichotomy found in economics. Descriptive theories attempt to reflect the process and outcomes of human decision making, including any systematic deviations from rationality. By contrast, normative theories give rational solutions to decision problems. Both classes of theory are potentially of interest here: a descriptive approach might involve specifying agent rules motivated by empirical evidence of how people behave when presented with a particular decision problem. Alternatively, a normative approach could involve using decision theory to derive maximising behaviour in the same context. Moving between these approaches is convenient, because individual models of decision making are to a large extent modular by virtue of requiring the same inputs to deliver a decision.

The case for decision theory as an underpinning for agent based modelling rests on several attractive features, key amongst which is the potential to offer psychological plausibility. Recent work in neuroeconomics (see particularly (Padoa-Schioppa and Assad 2006), and (Rustichini 2009) for a more general review) suggests that the concept of a universal currency for comparing the desirability of outcomes in the brain has a solid evidence base. From a pragmatic perspective, the decision rules are not computationally demanding, and are as modular, demonstrated in this case study by the use of multiple theories with no change to the surrounding model. In a similar vein, altering the decision problem does not require a reconstruction of the agents. This raises the possibility of effectively training a population of agents in one setting, and subsequently allowing them to use the resultant beliefs in different circumstances. Also appealing is the possibility to contribute to the field of decision theory by providing a convenient test for decision rules, since the validity of the large scale behaviour of the model can be seen as indicative of the capability of the decision rule at the local level.

Combining this with a game theoretic framing of the problem gives a well understood framework for formalisation, which can be trivially translated into a set of decision problems by treating games ‘as if’[1] against nature (Insua, Rios, and Banks 2009). This recasts the problem from one of reasoning about the psychology of an opponent, to inferring the probability distribution underlying the behaviour of a black box.

The Disclosure Game {#case}
===================

In our model, we let the world be populated by two groups of agent: pregnant women, and midwives. Each agent may be one of three types, which for women represents a level of alcohol consumption, and for midwives the extent to which they react negatively to pregnant women drinking. The type of an agent is assigned ‘by nature’, and is initially private information. The two kinds of agent meet, and play a variation on a signalling game (Kreps and Cho 1987) where the set of possible rewards depends on the type of both players. In a round of the game, the woman sends a signal indicating she is one of the three drinking types, and the midwife may choose to refer them to a specialist[2]. Women receive a social payoff contingent on the signal they sent, and the type of the midwife which is revealed to the woman at the end of the round; conversely, the midwife incurs a cost if a referral is made. Both players also receive an additional health outcome payoff depending on the drinking type of the woman, and the referral decision. Hence the woman’s payoff is social cost + health outcome, and the midwife’s is referral cost + health outcome.

If a woman is referred then that player’s game ends (see (NICE 2010)), and the referring midwife is always informed of the true drinking pattern. If they are not, then the midwife does not learn the outcome of the game, and the woman may continue to play until they are referred or their baby is born. In the simulation, the size of both populations remains constant, but the individual members of the population of women are replaced over time as they are referred or give birth.

Both groups of agents have a partially common interest in the health outcome, but potentially competing interests in that women would ideally avoid disclosing accurate information to avoid a social penalty arising from the negative reactions of midwives. Clearly this is a somewhat contrived scenario, which neglects much of the nuance and complexity of reality - for example we do not attempt to infer plausible payoffs, or distribution of drinking patterns, nor consider heterogeneity of utility - and is primarily illustrative of the methodology.

Four decision rules were considered: (1) simple Bayesian risk minimisation, which attempts to infer the distribution of player types, and likelihood of referral; (2) (Tversky and Kahneman 1992) with Bayesian updating, as a well known descriptive theory; (3) a simple lexicographic rule, which uses one reason decision making along the lines of a Fast and Frugal Heuristic (Gigerenzer and Goldstein 1996) and considers only the total payoff from a round; and finally (4) a second Bayesian risk minimisation rule which uses equivalent information to the heuristic method in (3).

The decision theoretic agents are engaged in playing a pair of repeated Bayesian games, where payoffs for both parties are dependent on some piece of information known privately by their opponent. Women play a signalling game, where they must decide how accurate a signal to send to ensure they receive the care required given their own alcohol consumption, balanced against the possibility of suffering social stigma for undesirable behaviour. Midwives are required to weigh the risk of delivering the wrong care against wasting resources, given the signal they receive from a woman. The payoff for the midwife depends on their action, and the player type of the woman, and the payoff for the woman depends on their signal, the player type of the midwife, and that midwife’s action, with the addition that a referral by the midwife ends the game for that woman.

Selected Results {#results}
================

While there is relatively limited empirical research with which to validate the behaviour of the model, qualitative trends suggesting that women will be more likely to disclose as they build a relationship with maternity staff have been reported (Phillips et al. 2007). Additionally, work by Alvik et al. (2006) indicates that heavy drinkers are more likely to under-report their own consumption as compared to moderate drinkers.

A Python implementation of the model[3] is able to produce both of these features. Figure illustrates this for the Bayesian risk minimisation agent, showing the average frequency of honest signals by heavy and moderate drinkers over the course of their appointments. Women’s beliefs are initially variable, and the perceived risk of a social cost may outweigh the benefit of disclosure. As they encounter more midwives their beliefs become more in line with the true distribution of midwife types, making disclosure more appealing.

The approach is imperfect, for example figure shows that there is a tendency to collapse to universal referral, which clearly does not occur in reality. Midwives are not initially inclined to refer women who signal as light drinkers, however encountering deceptive signalling increases the perceived risk of taking any claim of light drinking as accurate. In this instance, this may be attributable to the payoff structure, and drinking type distribution, which as noted in not claimed to be accurate. More broadly, it highlights the challenge of identifying an acceptable parameterisation, and then fine-tuning those parameters.

The performance of the other decision rules also present challenges, for example the purely payoff based decision rules are largely insensitive to the distribution of midwife types, suggesting that their representation of the game is insufficient. Both the lexicographic, and Bayesian payoff based decision rules are however able to demonstrate the qualitative trends in change in signalling behaviour.

is, in this context, an interesting failure. Agents using this decision rule show very little change over time, which may imply that the parameters used, or that the unrealistic payoffs lead to the wrong balance of risk aversion. is also not particularly designed to deal with decisions from experience, and has largely been studied in the context of decisions from description, although some research has found positive results in this area (e.g. (Hau and Pleskac 2008)). The complexity of as compared to the simpler Bayesian rule introduces the significant challenge of determining appropriate parameters, and increases run times, which together may outweigh the benefit of descriptive accuracy.

![Average fraction of population signalling honestly, for Bayesian risk minimising agents.](fig_1.png)

![Average fraction of population referred, for Bayesian risk minimising agents.](fig_2.png)

Conclusions and Present Work {#conc}
============================

In conclusion then, employing a decision rule approach can offer advantages in providing a theoretical foundation with at least the beginnings of a compelling evidence base. This can be achieved without a substantial technical overhead, and in game theory offers a well understood framework to design and debate the model. However, how the decision making is operationalised in such models, is an important decision in itself. The results, as demonstrated above, can be very sensitive to this operationalisation.

The present focus is on extending the model to allow for a parameterised approach to information sharing between agents. This is intended to facilitate exploration of the impact of both the breadth of sharing, and the effect of biased information. Both of these features are significant in an organisational context, for example reluctance to pass negative information upwards is thought to be a factor in project failure (Milliken, Morrison, and Hewlin 2003). From the women’s perspective, this is also of interest when considering the impact of public information campaigns, and press coverage of healthcare incidents. As a complement to this we are also exploring the introduction of networks to the model. This will facilitate investigation of the role of information derived from social networks in women’s attitudes to their healthcare professionals.

If successful, the combination of decision theoretic agents, and Bayesian games could provide a natural way to explore how the flow of information across networks influences individual behaviour, and how this contributes to large scale long term trends. These features are universal in scenarios relevant to population health, for example factors impacting on the disclosure of HIV status in the developing world, or raising the issue of a need for activities of daily living support in the context of care for the elderly.

References
==========

Alvik, A, T Haldorsen, B Groholt, and R Lindemann. 2006. “Alcohol Consumption Before and During Pregnancy Comparing Concurrent and Retrospective Reports.” *Alcoholism: Clinical & Experimental Research* 30 (3) (March): 510–5.

Gigerenzer, G, and D G Goldstein. 1996. “Reasoning the Fast and Frugal Way: models of Bounded Rationality.” *Psychological Review* 103 (4) (October): 650–69.

Hau, R, and T J Pleskac. 2008. “The Description-Experience Gap in Risky Choice: The Role of Sample Size and Experienced Probabilities.” *Journal of Behavioral Decision Making* 518 (May): 493–518.

Insua, D R, J Rios, and D Banks. 2009. “Adversarial Risk Analysis.” *Journal of the American Statistical Association* 104 (486) (June): 841–854.

Kreps, D M, and I Cho. 1987. “Signalling Games and Stable Equilibria.” *The Quarterly Journal of Economics* 102 (2): 179–221.

Milliken, F J., E W. Morrison, and P F. Hewlin. 2003. “An Exploratory Study of Employee Silence: Issues That Employees Don’t Communicate Upward and Why\*.” *Journal of Management Studies* 40 (6) (September): 1453–1476.

NICE. 2010. *Pregnancy and Complex Social Factors. CG110*. Manchester: NICE.

Padoa-Schioppa, C, and J A Assad. 2006. “Neurons in the Orbitofrontal Cortex Encode Economic Value.” *Nature* 441 (7090) (May): 223–6.

Phillips, D, K Thomas, H Cox, L A Ricciardelli, J Ogle, V Love, and A Steele. 2007. “Factors That Influence Women’s Disclosures of Substance Use During Pregnancy: A Qualitative Study of Ten Midwives and Ten Pregnant Women.” *The Journal of Drug Issues* 37 (2): 357–376.

Rustichini, A. 2009. “Neuroeconomics: what Have We Found, and What Should We Search for.” *Current Opinion in Neurobiology* 19 (6): 672–7.

Tversky, A, and D Kahneman. 1992. “Advances in Prospect Theory: Cumulative Representation of Uncertainty.” *Journal of Risk and Uncertainty* 5 (4) (October): 297–323.

Waldherr, A, and N Wijermans. 2013. “Communicating Social Simulation Models to Sceptical Minds.” *Journal of Artificial Societies and Social Simulation* 16 (4): 13.

[1] i.e. from the perspective of the agent, since nature is generally disinterested which is not the case here.

[2] In the NHS, this is generally a specialist midwife, but may also involve a multi-agency team. See NICE (2010) for the full guidelines.

[3] Available from https://github.com/greenape/disclosure-game
