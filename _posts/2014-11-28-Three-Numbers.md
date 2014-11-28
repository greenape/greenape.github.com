---
layout: post
title: Three Numbers
description: How to tell the difference between three numbers, and the importance of context.
comments: true
share: true
---


I have spent an inordinate amount of time in the last few months, wrestling with
a problem so trivial it hardly bears considering. Despite this, the problem has
defeated all those who have encountered it.

The problem, in the most general form, is this: how do you tell how different
some numbers are?

More specifically, given three numbers, which are all between 0 and 2, what
measure is the best one to tell you how different they are?

This raises a difficult question. What do we mean by different? Dissimilar?
Distant? In this case, I did know what I meant by different - we want a measure
which is maximised by any permutation of 0, 1, 2, and minimised where all three
are the same number. Ideally, scenarios where two numbers are the same should be
a half way point.

Which turned out to be harder than it sounds.

My first gasp measure, when looking at how different things are, would always be
standard deviation. This looks promising -

{% highlight python %}
import numpy as np
np.std([0, 0, 0])
0.0

np.std([0, 1, 2])
0.81649658092772603
{% endhighlight %}



Brilliant - the our most different possible set, is pretty high, and the most
similar is zero. This is also true whenever all three are the same number
(obviously).  What isn't ideal, is this:


{% highlight python %}
np.std([0, 2, 2])
0.94280904158206336
{% endhighlight %}



Two of those numbers look suspiciously similar to me. But the set has a higher
standard deviation. Not ideal. How about an alternative measure of spread - the
IQR?

{% highlight python %}
np.subtract(*np.percentile([0, 2, 2], [75, 25]))
1.0

np.subtract(*np.percentile([0, 1, 2], [75, 25]))
1.0

np.subtract(*np.percentile([1, 1, 1], [75, 25]))
0.0
{% endhighlight %}



A little better, in that the two-numbers-the-same scenario isn't actually
*higher* than our dubiously define maximum scenario. But, still not ideal. How
about a more geometric interpretation of the problem, like, average absolute
difference?

{% highlight python %}
from itertools import permutations
    
def abs_distance(numbers):
    pairs = permutations(numbers, 2)
    return map(lambda (x, y): abs(x - y), pairs)
    
def avg_abs_distance(numbers):
    dists = abs_distance(numbers)
    return np.mean(dists)
{% endhighlight %}

Naturally, this also doesn't work:

{% highlight python %}
avg_abs_distance([0, 0, 0]), avg_abs_distance([0, 1, 2]), avg_abs_distance([0, 2, 2])

(0.0, 1.3333333333333333, 1.3333333333333333)
{% endhighlight %}



And the same, but moreso for mean squared difference:

{% highlight python %}
def sq_distance(numbers):
    pairs = permutations(numbers, 2)
    return map(lambda (x, y): pow(x - y, 2), pairs)
    
def avg_sq_distance(numbers):
    dists = sq_distance(numbers)
    return np.mean(dists)
    
avg_sq_distance([0, 0, 0]), avg_sq_distance([0, 1, 2]), avg_sq_distance([0, 2, 2])

(0.0, 2.0, 2.6666666666666665)
{% endhighlight %}



Because the numbers vary independently, we can't guarantee that they form a
triangle, so any approaches along those lines are right out. Since I'm not a
particularly good statistician, I decided to consult
[one](http://smalltown2k.wordpress.com/) at this point. He suggested a linear
regression like approach - you know what the *right* line is, so, use the three
numbers to work out the residuals and you can use residual sum of squares[^1].
This makes zero the most different your numbers can be (there are no residuals).

Here's the right line (y=x):

{% highlight python %}
from pylab import *
    
right_line = [0, 1, 2]
plot(right_line, right_line, 'b*-')
show()
{% endhighlight %}


![png]({{ site.url }}/images/three%20numbers_17_0.png)


And here's a wrong line:

{% highlight python %}
right_line = [0, 1, 2]
plot(right_line, right_line, 'b*-')
rubbish_line = [1, 1, 1]
plot(right_line, rubbish_line, 'r*-')
show()
{% endhighlight %}

![png]({{ site.url }}/images/three%20numbers_19_0.png)


Working out the residual sum of squares is pretty easy -

{% highlight python %}
    def rss(points):
        residuals = np.array(points) - np.array([0, 1, 2])
        return np.sum(np.power(residuals, 2))
    
    rss([1, 1, 1]), rss([0, 1, 2])

    (2, 0)
{% endhighlight %}


Nice. But we should amend our method, because right now...

{% highlight python %}
    rss([2, 1, 0]), rss([1, 2, 0]), rss([0, 2, 1])

    (8, 6, 2)
{% endhighlight %}


Which isn't quite right. This is easily resolved, by sorting the points before
calculating residuals.

{% highlight python %}
    def rss(points):
        points = np.array(points)
        points.sort()
        residuals = points - np.array([0, 1, 2])
        return np.sum(np.power(residuals, 2))
    
    rss([2, 1, 0]), rss([1, 2, 0]), rss([0, 2, 1])

    (0, 0, 0)
{% endhighlight %}


Much better. Unfortunately -

{% highlight python %}
    rss([0, 0, 2]), rss([0, 0, 0]), rss([0, 0, 1])

    (1, 5, 2)
{% endhighlight %}


The result is a horrible metric, for these purposes. And the same applies to
related measures like mean squared error -

{% highlight python %}
    def mse(points):
        points = np.array(points)
        points.sort()
        residuals = points - np.array([0, 1, 2])
        return np.mean(np.power(residuals, 2))
             
    mse([0, 0, 2]), mse([0, 0, 0]), mse([0, 0, 1])

    (0.33333333333333331, 1.6666666666666667, 0.66666666666666663)
{% endhighlight %}


At which point, I gave up and used the interquartile range.

You'll notice, that at no point have I given you any context for this problem.
Where do these three numbers come from? Why do we need to know how different
they are? This is important, because a better solution to my *actual problem*
arose from the context - measuring how different three numbers are, leads to an
overcomplicated solution, to an oversimplified problem.

[^1] He actually suggested a more sophisticated method than this, but the end
result is similar.
