---
layout: post
title: Wired for sound
description: My staggeringly unoriginal use of the raspberry pi.
hn-discussion:
comments: true
share: true
---

I imagine most people have heard of the [Raspberry Pi](http://www.raspberrypi.org/), a teeny-tiny, very cheap computer. The pi is incredibly cheap, and as I understand it was intended to fill the 'playing with the guts of computers' gap, which was an integral part of using things like Commodore 64s, Amigas, and so on. The cornerstone of the idea was that kids could use it to learn about computers and do cool stuff.

The first people to use it were grown up hobbyists, naturally. I picked one up when they first materialised, with the idea that I'd use it to build brain controlled robot by hooking it up to a [Neurosky](http://neurosky.com/) MyndPlay. The idea was to do a really ghetto version of something like [this](http://www.youtube.com/watch?v=HR0NBHJWdAU), or [this](http://www.theguardian.com/science/video/2012/may/16/mind-controlled-robotic-arm-video), or the wheelchair in [that episode of Top Gear](http://www.youtube.com/watch?v=Cga0xqSHbDs). But a remote control car.

Inevitably, having acquired the kit, I never got around to it [the MyndPlay device probably wouldn't be up to the job anyway), and the Pi sat on a shelf for several years. Other people have done some cool stuff, for example [counting cars](http://smalltown2k.wordpress.com/2014/01/03/building-a-visual-traffic-counter/), or hoarding sufficient Pis to [build a supercomputer](http://www.southampton.ac.uk/~sjc/raspberrypi/)[^1].

Up until very recently, the audio solution in our house was a jailbroken iPod touch, running an airplay receiver, plugged into the stereo. This actually worked amazingly well[^2], and alleviated the vast annoyance of getting up to walk 5' and plug things in, or press buttons like some sort of [animal](http://www.youtube.com/watch?v=SOJJf_zoPDs#t=153). All was not entirely well however, as despite having a TV with arcane powers, watching (legally acquired) videos required buggering about with HDMI cables, and dealing with the increasingly eccentric fullscreen behaviour of OSX.

Fortunately for me, while my Pi was sitting collecting dust in its fine [lego case](http://www.raspberrypi.org/wp-content/uploads/2012/07/raspberry-pi-lego-case-4_1_1.png), people have been hard at work doing things like porting XBMC to it, and adding an AirPlay receiver to boot.

This meant I could just whack the excellent [Raspbmc](http://www.raspbmc.com/) on an SD card, plug in a cheap USB wifi dongle[^3], and [ka-blamo!](http://www.youtube.com/watch?v=qn7duAZjP8w) We have sound, and I could move the iPod solution to the kitchen, allowing us to have thumping bass while making toast.

I wanted to go further. The Pi has hardware video decoding. It seemed folly to not take advantage of that, so I figured the thing to do was check out media servers. Years ago, I'd attempted to do this straight to the TV with [Plex](https://plex.tv/), and failed utterly. Plex has come a ways since then, and crucially, XBMC is considerably more adaptable than Samsung's smart tv software[^4]. Some clever dudes, had actually already written a [plugin](https://github.com/hippojay/plugin.video.plexbmc) that did exactly what I was wanting - you can browse stuff in Plex from XBMC, or [more awesomely), you can start a movie playing from Plex to XBMC.

I don't know about you, but sitting with my laptop and just magically throwing a movie to my TV is still pretty futuristic to me.

I had to do some fiddling around, for example [forking](https://github.com/greenape/plugin.video.plexbmc) the plugin to deal with a bug in the cElementTree library. And, after much cursing, discover that the whole shebang will only work if you use the Plex web interface on the external IP of wherever it happens to be running. [I spent several hours trying to work out why it kept trying to load videos from 127.0.0.1, before realising this.)

And finally... It works! I can play audio from iTunes all over the house [out of sync audio), and I can throw HD video across the room, thereby reducing the number of times I need to move in a day and increasing my risk of DVT. Woohoo!

[^1]: This guy had the unenviable task of trying to teach me numerical methods. My mark was saved only by the other half of the course being C programming.
[^2]: If you have macs, obviously. Totally useless otherwise.
[^3]: An Edimax [nLite](http://www.edimax.com/edimax/merchandise/merchandise_detail/data/edimax/global/wireless_adapters_n150/ew-7711uan), specifically.
[^4]: The point where you can't use the iPlayer because Samsung's data center is [on fire](http://www.engadget.com/2014/04/20/samsung-com-outage-sds-fire/) is where you realise you don't really control this device.