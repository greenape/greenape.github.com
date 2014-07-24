---
layout: post
title: Temporal Difference
summary: A simulator for a model of associative learning I wrote a few years back, and the paper on it we just published.
status: draft
hn-discussion:
---

Many moons ago, while I was doing a belated BSc in computer science and AI, I was fortunate enough to fall into the company of [Eduardo Alonso](http://www.soi.city.ac.uk/~eduardo/), and [Esther Mondragón](http://cal-r.org/mondragon/), and had the opportunity to build a simulator for my final year project. The simulator was an extension of an excellent tool for simulating arguably the best known model of classical conditioning, the [Rescorla & Wagner model](http://www.scholarpedia.org/article/Rescorla-Wagner_model) (you can get it [here](http://cal-r.org/index.php?id=R-Wsim)).

The simulator we built then, was for the [Temporal Difference model](http://www.scholarpedia.org/article/Temporal_Difference_Learning), which is actually very similar to Rescorla-Wagner, but can be applied in real time. You can, incidentally, get ahold of [that](http://cal-r.org/index.php?id=TD-sim), and the [source](https://github.com/cal-r/td) for it as well, if you're interested.  The TD algorithm was developed by [Richard Sutton](http://www.cs.ualberta.ca/~sutton/), and turns up all over the place, notably as an algorithm for training neural nets to play backgammon (almost) as well as humans. Besides that, there's also pretty good evidence that it describes the behaviour of some types of neurones.

After finishing up the original simulator, we started to work on extending it, and the underlying model. One of the features we'd included in the original was the ability to use configural cues, which were a later addition to the Rescorla-Wagner model. To briefly explain what that actually means - imagine that we are Pavlov, training our dogs to dribble at the bing of a bell. (Visualise stroking your [impressive beard](http://en.wikipedia.org/wiki/Ivan_Pavlov#mediaviewer/File:Ivan_Pavlov_NLM3.jpg), if that helps.)  Now, as well as the bell, we want to train the dogs to dribble when they hear the bell and see a light. In fact, they should only dribble when both of these things happen at the same time.

Now, I know you're an experienced dribble wrangler, but let me sketch out how you achieve this. Clearly, you need to bing the bell, and flash a torch or somesuch when you feed the dog. This will associate the bell, and the light, with food and bring the drool. But, we only want the dog to slobber (let's assume we're not using [Beethoven](http://makeagif.com/i/AiKytX) for our experiment), when both happen, and to ignore either on their own. So, we also need to bing the bell every so often, and not feed the dog, and do the same with the light.

I'll give you a moment to verify that this works on a nearby colleague, younger sibling, or willing pet.

Done? Great. It works. But, neither Rescorla-Wagner, nor TD can reproduce it. 

Basically, this is because the algorithm doesn't distinguish between the combination of the bing and light, and them happening separately. Configural cues solve this very simply - there are the two stimuli, and then we imagine another one that is the combination of both. This means that, given enough training, the algorithm learns to associate dinner with the combination, but not with the bell or the torch.

By way of a demonstration, here's two graphs. First, without configural cues:

![Configural cues off]({{ site.url }}/images/no_configural.png)

And now with a configural cue representing the combination of A & B (that's the c(AB)):

![Configural cues on]({{ site.url }}/images/configural.png)

Very cool, if you're into that sort of thing.

So far, so good. Now, I'm briefly going to talk about one of the additions we made in the newer simulator (you can read about this in vastly more detail in the just-published [PLoS One article](http://dx.doi.org/10.1371/journal.pone.0102469)), which was to extend the idea to sequences of stimuli, rather than just ones that happen at the same time.

Animals are pretty clever, and can be trained to respond to sequences of stimuli. We want dribble if the light follows the bell, but not if they happen at the same time, or the other way around. You can't do this, under the Rescorla-Wagner model, because it ignores the existence of time. You also can't do this under TD, even with configural cues - the bell-light combination only exists if they happen at the same time.

Let's give it a quick try in the simulator, training with dinner after A followed by B, and no dinner after A and B together, or B followed by A.

Here's what happens with vanilla TD:

![Vanilla]({{ site.url }}/images/sequence.png)

Sort of a weakish response to both. Not quite right.

How about TD with a basic configural cue representing A & B together?

![Configural]({{ site.url }}/images/sequence_configural.png)

We solve this, by imagining a different kind of added cue, one that represents the order of events. So there's a way to distinguish A-then-B from B-then-A. Running this in the simulator gives us this:

![Serial configural]({{ site.url }}/images/chicken_dinner.png)

A and B pretty much cancel each other out, which leaves us with A-then-B, which as you'd hope gives you a dog expecting his dinner, and B-then-A, which leads to this:

![Ehhhhhhh](http://i.imgur.com/zuBK9DD.jpg)

If that piqued your interest, you can [download the simulator](http://cal-r.org/index.php?id=SSCC_TD_sim), check out the [source](https://github.com/cal-r/sscctd), and [read the paper](http://dx.doi.org/10.1371/journal.pone.0102469).
