---
layout: post
title: The time I crashed a supercomputer
description: In fact, one, of the times I crashed the supercomputer, using only python.
hn-discussion:
comments: true
share: true
---

I am in many ways, incredibly fortunate. Amongst the many boons granted to me is access to the University of Southampton's [Iridis](https://www.southampton.ac.uk/isolutions/computing/hpc/iridis/) HPC facility. Or setting aside the cryptic acronyms - we have wonderful toys, amongst which is a supercomputer of terrifying scale. 750 nodes, each with 16 CPUs, and currently the [322nd](http://www.top500.org/system/178203) most powerful computer on earth.

Let me tell you about the time I broke it, using Python.

I spend the majority of my time these days working in Python, and R. Increasingly, I do both on my laptop using the brilliant [Jupyter](https://jupyter.org/), but on occasion I need something with a little more grunt. This is where Iridis comes in. A lot of the usage for HPCs comes from people working on gigantic, (incredibly difficult hard sciences problems)[http://cmg.soton.ac.uk/research/] - mind bogglingly complex simulations of nanomaterials, planetary scale climate modelling. That sort of jazz. I use it to run small scale Agent Based Models, across vast swathes of parameter space. This type of thing, which involves lots of repetitions of relatively quick simulations, falls squarely into the space of embarrassingly parallel problems. 

This makes running my kind of simulations really easy - there's no real need for interaction between processes, so you can just spin up a python interpreter for every cpu, set it running with a point in your parameter space, and go have coffee. When you come back, you just need to stitch together the output.

This was clearly too easy. Just running the same code I'd use on a machine with 4 cores, on a few hundred, felt like cheating. And besides, stitch together thousands of CSV files at the end seemed gauche. In addition, even when you have hundreds of CPUs to throw at it, Python is not the fastest thing on no legs.

I rewrote my code extensively, leaving my simulation code largely intact, but wrapping it all up such that I could make use of cool tools like [SCOOP](https://github.com/soravux/scoop) to scale across available nodes, and switching to SQLite for storing results.

This worked brilliantly, until it didn't.

I started sensibly, gradually scaling up my simulations. More runs, more regions of parameter space. More measurements. And then one day, I got an e-mail from the Iridis team, patiently, and politely, informing me that I had crashed 12 nodes, and left 191 cores sitting idle for the best part of a day. (I had to look up the e-mail to get those details, and I'm cringing as a result.)
Aside from being embarrassing, this was perplexing - the nodes had crashed, because my code had eaten straight through all their memory. Which should never happen. Python should have failed before the node, and that hadn't happened.

It was only a year later, after crashing the supercomputer again, that I finally worked out what the problem was. In the meantime, I profiled, and refactored, and optimised, I also switched to [PyPy](http://pypy.org), to take advantage of the effectively free speedup to my code and potentially reduced memory use. I discarded SCOOP, because one of the reasons for the egregious memory use was unlazy evaluation of iterators. At the end of my refactoring, I arrived back at code which was essentially equivalent to the dump, interpreter per CPU implementation I'd started with. Better written, but still dumb.

This worked fine, for the next year. Then, I added what I knew would be a very memory intensive bit of code to collect every event in a simulation run (the idea was to use this for some exciting graphics). I tested extensively, still haunted by my past sins against the HPC team. I tried, aggressively, to force the code to fail on my desktop, and to ensure that where it did, it did so tidily and without blowing up the machine. I could force it to run out of memory, and Python would fail noisily with an OutOfMemoryError.

So far, so good. I fired off the code on the supercomputer, and promptly crashed a fistful of nodes.

This time, I saw it happen before the e-mail. My stomach turned, my skin prickled with cold sweat - there is no fear quite like breaking somebody else's very expensive toy. I killed all my other jobs, and waited for the inevitable.

While I waited, in between considering fleeing the country, I thought about how this was even possible. The code was radically different, and running on a different interpreter, but had clearly brought down the nodes in a remarkably similar way. Why wasn't the normally friendly snake saving my ass from my own stupidity? Surely the interpreter knew it only had 64GB of RAM?

The e-mail came, and incredibly patiently asked me to please not do whatever it was, again. I'd crashed more nodes, because my code had eaten through the RAM and was trying to write to scratch, which the diskless nodes had none of. I imagined the HPC building bursting into flames, hazmat suited figures running as coolant billowed across the campus, and stepped away from the computer.

It was only a few days later that I finally realised how it might be possible to use python to crash a machine by eating all the memory. Python would need to be wrong about how much memory it had to work with. Python obscures this from you, unlike Java, where mucking about with heap and stack sizes is more difficult to avoid, but in fact the interpreter just goes ahead and assumes that it can use as much RAM as you have.

So, in the unlikely event that you were to spin up 16 interpreters on a machine with 64GB of RAM, all 16 will happily say to themselves "Splendid! I have 64GB of RAM to play with.", and perhaps more significantly "no hurry on the garbage collection then". In fact, it might just be possible to arrive at a situation where the 16 interpreters could demolish the available RAM between them, before an OutOfMemory could be triggered.

Whether this should be preventable through through configuration of the node, I couldn't tell you. However what is possible with PyPy is to fix the maximum heap size, which (together with more memory profiling), solved the problem.

TLDR; crashed a supercomputer using python, felt bad, fixed it by explicitly limiting the heap size in pypy.

