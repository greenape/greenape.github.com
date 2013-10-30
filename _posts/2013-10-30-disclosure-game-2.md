---
layout: post
title: "Disclosure Game 2"
description: "On games and information"
category: "disclosure game"
tags: [games, monopoly, game theory]
---
{% include JB/setup %}
I mentioned in my previous [post]({% post_url 2013-10-28-disclosure-game-1 %}) that the telling potentially damaging, possible beneficial secrets situation looked like a game. Let's dig into what I meant by that a little before explaining how this particular game works.  Game, in this situation, has a slightly different definition from the usual Monopoly, or Mario Kart scenarios. This is a more abstract notion of game.

Let's think about monopoly. Monopoly is, as anybody who has spent a wet and argumentative weekend will know, a pretty complicated game. But, if you break it up into extremely broad categories of thing, is actually made up of not that many bits. You need some players, and you need some rules. The rules are the most obviously complicated bit, and describe the order of play, the moves you can make, and what happens when you roll a six and your annoying cousin has all the utilities. Making that a little more abstract, you have moves, and you have payoffs for those moves which may depend on moves made by other players.
Perhaps less immediately obviously, each player has a bunch of information about the state of the game - you can see the board, you know the rules, you know the dice are pretty much fair, and that Aunt [Eve](http://en.wikipedia.org/wiki/Alice_and_Bob) is a goddamn sneak.

So now we have a pretty abstract idea of a game. Players that make moves based on their information to try get the best payoff, moves that are prescribed by a set of rules, and payoffs that depend of the rules and moves made by other players.

The nice thing about a definition that abstract, is that you can apply it to all sorts of different scenarios that don't instantly appear to be games. Hence, game theory ([would you like to know more?](http://gametheory101.com/)).

Now, easily the most famous game in this context is the [Prisoner's Dilemma](http://en.wikipedia.org/wiki/Prisoner's_dilemma), where two guys have robbed a bank, and the police are trying to persuade them to flip on each other. If they both stay quiet, they both go to jail for a little while. If they both turn on each other, they go down for a long haul. But, if only one flips and the other stays schtum, the flipper goes free and the guy who kept his trap shut does serious time.
There have been a few (tens of thousands) things written on this topic, so I'm not going to talk about the solutions to the game.

Instead, let's relate this back to the abstract game from before, and talk about information.
In most versions of the dilemma, the scenario is one of 'perfect information'. Both players know all the rules, and everything about the other player. If you assume that the other player is in the same situation, and will always act in a perfectly rational (i.e. self interested to the point of sociopathy) way, there's only one move to make (flip on the other guy).
Fine so far. But let's go back to monopoly again. Monopoly is, even if we take out most of the rules, quite a different situation. For one thing, you don't all move at the same time (except for the bit at the start where you fight over the counters). For another, there are a bunch of random elements - chance cards, dice, and so on.
Ok, so you can know a bunch of probabilities about dice throws, card orders and so on. But this definitely changes the situation.
We can deal with this conveniently by imagining that these random things are actually the actions of another player, who by convention is called Nature.

Now, lets say Aunt Eve has brought her daughter Alice who has lived with her dad Bob in Armenia for the last ten years. Obviously, you all sit down to play Monopoly. You know Eve plays dirty, but you have no idea about Alice. This is the real world, so assuming that she's going to play perfectly rationally is a touch unrealistic. The situation is now one of incomplete information.
To make this a bit less real, we imagine that you, Bob, Eve, and Alice have a type that governs how you play. Let's also change our thinking about monopoly a bit and say that 'winning' is actually about personal satisfaction. You and Eve are only happy if you win, Bob is happy whatever happens (Bob only plays monopoly drunk). Alice is an unknown quantity - she could be either type.

While clearly still a gross simplification, this starts to sound a bit more like reality.

As I mentioned earlier, you can apply game theory to things that are not obviously game like, for example [job interviews]({{http://en.wikipedia.org/wiki/Signalling_(economics)#Assumptions_and_groundwork | cgi_escape}}). Of which, more in a subsequent post.



