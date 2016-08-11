var game;
var pointsArray = [];
var pointColors = ["0x00ff00", "0x008800", "0x880000", "0xff0000"];
var colorMap = {
     nodeDone:0x808080,
     nodeDoneHighlight:0x9c9c9c,
     nodeDoneActive:0xb0b0b0,
     nodeDoable: 0x36a93f,
     nodeDoableHighlight: 0x40c94b,
     nodeDoableActive: 0x41f250,
     nodeNotDone: 0x5b4fad,
     nodeNotDoneHighlight:0x7d73bf,
     nodeNotDoneActive:0x8e84d2,
     link:0x5b4fad,
     linkHover:0x6f60d4,
     linkDone:0x36a93f,
     linkHoverDone:0x40c94b,
     linkDoneDone:0x808080,
     linkHoverDoneDone:0x9c9c9c,
     linkHighlight:0x5b4fad,
     linkHighlightDone:0x5b4fad
};
var bezierGraphics;
var movingSprite;
var nodes = [];
var buttons = [];
var links = [];
var beziers = [];
var nodeChanged = true;
var depth = 1;
var polys = [];
var stepPolys = [];
var nodeWidth = 10;
var baseNodeHeight = 15;
var vPad = 25;
var hPad = 150;
var linkLayer;
var nodeLayer;
var buttonLayer;
var nodePartLayer;
var textLayer;
var userID;
var nodesRef;
var linksRef;
var worldWidth = 4000;
var nowX = worldWidth/2;
var myFirebaseRef = new Firebase("https://flickering-heat-3413.firebaseio.com");
myFirebaseRef.onAuth(function(authData) {
     if(authData === null) { return;}
     userID = authData.uid;
    nodesRef = myFirebaseRef.child("nodes").child(userID);
    linksRef = myFirebaseRef.child("links").child(userID);
    existingNodes = nodes.slice(0);
    existingLinks = links.slice(0);
    firebaseSetup();
    existingNodes.forEach(function(node) {
          nodeToFirebase(node);
    });
    existingLinks.forEach(function(link) {
          linkToFirebase(link);
    });
});

function twitterLogin() {
myFirebaseRef.authWithOAuthPopup("twitter", function(error, authData) {
  if (error) {
    console.log("Login Failed!", error);
  } else {
    myFirebaseRef.child("users").child(authData.uid).set({
      provider: authData.provider,
      name: getName(authData)
    });
  }
});
}

function getName(authData) {
  switch(authData.provider) {
     case 'password':
       return authData.password.email.replace(/@.*/, '');
     case 'twitter':
       return authData.twitter.displayName;
     case 'facebook':
       return authData.facebook.displayName;
  }
}

window.onload = function() {
	game = new Phaser.Game("100%", "100%", Phaser.CANVAS, 'todo-app');
	game.state.add("PlayGame", playGame)
	game.state.start("PlayGame");	
}

function firebaseSetup() {
     // Value changed callbacks
     nodesRef.on('child_changed', function(childSnapshot, prevChildKey) {
          console.log(childSnapshot.key() + ": " + childSnapshot.val());
          console.log(childSnapshot.val());
     });
     linksRef.on('child_changed', function(childSnapshot, prevChildKey) {
          console.log(childSnapshot.key() + ": " + childSnapshot.val());
     });
     // Node added callback
     nodesRef.on('child_added', function(childSnapshot, prevChildKey) {
          if(nodes.filter(function(node) { return node.uuid === childSnapshot.key()}).length) { return;}
          firebaseToNode(childSnapshot.key(), childSnapshot.val());
     });
     // Link added callback
     linksRef.on('child_added', function(childSnapshot, prevChildKey) {
          if(links.filter(function(link) { return link.uuid === childSnapshot.key()}).length) { return;}
          firebaseToLink(childSnapshot.key(), childSnapshot.val())
     });
     // Node deleted callback
     nodesRef.on('child_removed', function(oldChildSnapshot) {
          nodes.forEach(function(node) {
               if(node.uuid === childSnapshot.key()) {
                    deleteNode(node);
               }
          });
     });
     // Link deleted callback
     linksRef.on('child_removed', function(oldChildSnapshot) {
          links.forEach(function(link) {
               if(link.uuid === childSnapshot.key()) {
                    deleteLink(link);
               }
          });
     });
}

var playGame = function(game){}
playGame.prototype = {
	preload: function(){
          game.load.image("point", "FFFFFF.png");   	
          game.load.image("center", "FFFFFF.png");  
	},
	create: function(){
          //game.add.plugin(Phaser.Plugin.Debug);
          //game.physics.startSystem(Phaser.Physics.ARCADE);
          //game.input.onDown.add(clickNode, this);
          game.plugins.add(Phaser.Plugin.SaveCPU);
          game.world.setBounds(0,0, worldWidth, 2000);
          var key = game.input.keyboard.addKey(Phaser.Keyboard.BACKSPACE);
          key.onDown.add(backspace, this);
          key = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
          key.onDown.add(toggleDone, this);
          game.input.onTap.add(tapDispatcher, this);
          game.input.mouse.mouseWheelCallback = scrollEvent;
          linkLayer = game.add.group();
          nodeLayer = game.add.group();
          nodePartLayer = game.add.group();
          textLayer = game.add.group();
          buttonLayer = game.add.group();
          game.time.desiredFps = 30;
	},
     update:function(){
          drawLinks();
     },
}

function scrollEvent(event) {
     //console.log(event);
     deltaX = event.deltaX;
     deltaY = event.deltaY;
     if(Math.abs(deltaX) > Math.abs(deltaY)) {
          //console.log("ScrollX");
          game.camera.x += deltaX;
          event.preventDefault();
     }
}

function tapDispatcher(pointer, isDoubleClick) {
     console.log("Tap..");
     if(over(nodes) || over(buttons)) {
          console.log("Tapped a node");
          node = nodes.filter(function(node) { return node.getBounds().contains(game.input.x, game.input.y);}).pop();
          if(isDoubleClick) {
               textTap(node.text);
          } else {
               nodeTap(node);
          }
     } else {
          clickNode();
     }
}


function startDrag(){
     //console.log("DRAGGING");
}

function stopDrag(){
     
}

function nodeDragStart(sprite) {
}

function nodeDragUpdate(sprite, pointer, dragX, dragY, snapPoint) {
     sprite.button.x = sprite.x + nodeWidth/4;
     sprite.button.y = sprite.y + baseNodeHeight/4;
     sprite.text.x = sprite.x + nodeWidth;
     sprite.text.y = sprite.y + sprite.scale.y/4;
     for(var i = 0; i < links.length; i++) {
          line = links[i];
          if(Object.is(line.source, sprite)) {
               line.dirty = true;
               line.fromSprite(line.source, line.sink, false);
          } else if(Object.is(line.sink, sprite)) {
               line.dirty = true;
               line.fromSprite(line.source, line.sink, false);
          }
     }
}

function nodeDragStop(sprite, pointer, dragX, dragY, snapPoint) {
     fixLocation(sprite);
}

function buttonDragStart() {

}

function buttonDragUpdate(sprite, pointer, dragX, dragY, snapPoint) {
     //console.log(overlaps(sprite, nodes));
}

function buttonDragStop(sprite, pointer, dragX, dragY, snapPoint) {
     var rebound = game.add.tween(sprite);
     rebound.to({ y: sprite.node.y + baseNodeHeight/4, x: sprite.node.x + nodeWidth/4}, 1000, Phaser.Easing.Elastic.Out);
     rebound.start();   
     var other_buttons = buttons.filter(function(val) {
          return !Object.is(val, sprite);
     });

     if(overlaps(sprite, nodes)) {
          //console.log("Over node.");
          overlaped = overlapping(sprite, nodes);
          if(!Object.is(overlaped, sprite.node)) {
               linkToFirebase(makeLink(sprite.node, overlaped));
          }
     } else if(overlaps(sprite, other_buttons)) {
          //console.log("Over button.");
     } else {
          node = addNode(true);
          linkToFirebase(makeLink(sprite.node, node));
     }
}

function createNode(x, y) {
     p = game.add.sprite(x + nodeWidth/2, y + baseNodeHeight/2, 'point');
     p.inputEnabled = true;
     p.input.enableDrag();
     p.events.onDragStart.add(nodeDragStart);
     p.events.onDragUpdate.add(nodeDragUpdate);
     p.events.onDragStop.add(nodeDragStop);
     //p.events.onInputDown.add(nodeTap);
     p.scale.setTo(nodeWidth, baseNodeHeight);
     p.rank = 0;
     p.uuid = guid();
     p.pos = 0;
     p.dummy = false;
     p.title = "";
     p.length = 1;
     var style = { font: "12px Arial", fill: '#ffffff', align: 'left', wordWrap: true, wordWrapWidth: hPad };
     p.text = game.add.text(x+nodeWidth, y+p.scale.y/4, p.title,  style)
     p.text.inputEnabled = true;
     p.text.events.onInputDown.add(textTap);
     p.done = false;
     p.highlighted = false;
     textLayer.add(p.text);
     nodeLayer.add(p);
     p.notes = "";
     p.blobs = [];
     colorNode(p);
     return p;
}

function nodeToFirebase(node) {
     try{
          firebaseObj = {
               title: node.text.text,
               notes: node.notes,
               owner: userID,
               done:node.done,
               length: node.length
          };
          console.log(firebaseObj);
          nodeRef = nodesRef.push();
          node.uuid = nodeRef.key();
          nodeRef.set(firebaseObj);
     } catch(err) {
          console.log("Couldn't add to firebase.");
     }
}

function updateNode(node) {
     try {
          firebaseObj = {
               title: node.text.text,
               notes: node.notes,
               owner: userID,
               done:node.done,
               length: node.length
          };
          nodesRef.child(node.uuid).set(firebaseObj);
     } catch(err) {
          console.log("Couldn't update node.");
     }
}

function firebaseToNode(key, firebaseObj) {
     node = createNode(0, 0);
     button = createButton(0, 0);
     node.button = button;
     node.edges = [];
     button.node = node;
     buttons.push(button);
     nodes.push(node);    
     console.log(firebaseObj);
     node.title = firebaseObj.title;
     node.notes = firebaseObj.notes;
     node.uuid = key;
     node.text.setText(node.title);
     node.done = firebaseObj.done;
     node.length = firebaseObj.length;
     colorNode(node);
     bumpRank();
     vLayout();
}

function updateLink(link) {
     try {
          firebaseObj = {
               src: link.source,
               sink: link.sink
          };
          linksRef.child(link.uuid).set(firebaseObj);
     } catch(err) {
          console.log("Couldn't update link.");
     }
}

function linkToFirebase(link) {
     try {
          obj = {
               src: link.source.uuid,
               sink: link.sink.uuid,
               owner: userID
          };
          ref = linksRef.push();
          link.uuid = ref.key();
          ref.set(obj);
     } catch(err) {
          console.log("Couldn't add link to firebase");
     }
}

function firebaseToLink(key, firebaseObj) {
     src = nodes.filter(function(node) { return node.uuid === firebaseObj.src;}).pop();
     sink = nodes.filter(function(node) { return node.uuid === firebaseObj.sink;}).pop();
     link = makeLink(src, sink);
     link.uuid = key;
}

function createButton(x, y) {
     p = game.add.sprite(x + nodeWidth, y + baseNodeHeight, 'center');
     p.inputEnabled = true;
     p.input.enableDrag();
     p.events.onDragStart.add(buttonDragStart);
     p.events.onDragUpdate.add(buttonDragUpdate);
     p.events.onDragStop.add(buttonDragStop);
     //p.events.onInputDown.add(buttonTap);
     p.scale.x = nodeWidth/2;
     p.scale.y = baseNodeHeight/2;
     buttonLayer.add(p);
     return p;
}

function overlaps(target, objs) {
     for (var i = 0; i < objs.length; i++) {
               obj = objs[i];
               if(Phaser.Rectangle.intersects(obj.getBounds(), target.getBounds())) {
                    return true;
               }
     }
     return false;
}

function overlapping(target, objs) {
     for (var i = 0; i < objs.length; i++) {
               obj = objs[i];
               if(Phaser.Rectangle.intersects(obj.getBounds(), target.getBounds())) {
                    return obj;
               }
     }
}

function over(objs) {
     for (var i = 0; i < objs.length; i++) {
               obj = objs[i];
               if(obj.getBounds().contains(game.input.x, game.input.y)) {
                    return true;
               }
     }
     return false;
}


function clickNode() {
     node = addNode(false);
     bumpRank();
     vLayout();
     return node;
}

function backspace() {
     //console.log("Backspace");
     active = nodes.filter(function(node) { return node.active;});
     if(active.length){
          //console.log("Node is active.");
          deleteNode(active.pop());
     }
}

function toggleDone() {
     //console.log("Backspace");
     active = nodes.filter(function(node) { return node.active;});
     if(active.length){
          //console.log("Node is active.");
          node = active.pop();
          // Set the node to not done
          //Node can only be marked not done if no children are done
          if(node.done) {
               if(linksout(node).filter(function(n) { return n.sink.done}).length === 0) {
                    node.done = false;
               }
          } else {
               //Node can only be marked done, if all ancestors are done
               if(linksin(node).filter(function(n) { return !n.source.done;}).length === 0) {
                    node.done = true;
               }
          }

          updateNode(node);
          nodes.forEach(function(n) { colorNode(n);});
     }
     bumpRank();
     vLayout();
}

function deleteNode(node) {
     // Links to prune
     neighbours = links.filter(function(link) {
          return link.source.uuid === node.uuid || link.sink.uuid === node.uuid;
     });
     // Remove from links
     links = links.filter(function(link) {
          return link.source.uuid != node.uuid && link.sink.uuid != node.uuid;
     });
     //Remove from node list
     nodes = nodes.filter(function(n) {
          return n.uuid != node.uuid;
     });
     //Remove button from list
     buttons = buttons.filter(function(bt) {
          return bt.node.uuid != node.uuid;
     });

     splice(neighbours, node);
     //GFX to trash
     trash = neighbours.map(function(n) { return n.gfx;});
     trash = trash.concat(node.blobs);
     // Remove rendered links
     beziers = beziers.filter(function(bz) {
          return trash.indexOf(bz) === -1;
     });
     try {
          nodesRef.child(node.uuid).remove();
          neighbours.forEach(function(link) {
               linksRef.child(link.uuid).remove();
          });
     } catch(err) {

     }
     trash.push(node);
     trash.push(node.button);
     trash.push(node.text);
     trash.forEach(function(t) {
          t.destroy();
     });
     //Rerank nodes
     bumpRank();
     //Resize nodes
     neighbours.forEach(function(n) {
          resizeNode(n.source);
          resizeNode(n.sink);
     });
     beziers.filter(function(bz) {
          return neighbours.map(function(n) { return n.gfx;}).indexOf(bz) === -1;
     });
     //handle2.rank = Math.max(handle2.rank, handle1.rank + 1);
     vLayout();
}

function pruneLinks() {
     //Links crossing more than one rank
     spanning = links.filter(function(link) {
          return (link.sink.rank - link.source.rank) > 1;
     });
     trashList = [];
     spanning.forEach(function(link) {
          linksTmp = links.slice(0);
          links = links.filter(function(other) {
               return !Object.is(link, other);
          });
          //Is there another path between these two
          if(hasPath(link.source, link.sink)) {
               trashList.push(link);
          }
          links = linksTmp;
     });
     trashList.forEach(function(trash) {
          beziers = beziers.filter(function(bz) {
               return !Object.is(bz, trash.gfx);
          });
          trash.gfx.destroy();
          links = links.filter(function(other) {
               return !Object.is(trash, other);
          });
     });
     nodes.forEach(function(node) {
          resizeNode(node);
     })
}

function makeLink(handle1, handle2) {   
     if(hasPath(handle1, handle2, links)) {
          //console.log("Already linked.");
          return;
     }
     if(hasPath(handle2, handle1, links)) {
          //console.log("Preventing cycle.");
          return;
     }
     //console.log("Line from " + handle1.x + "," + handle1.y + " to " + handle2.x + "," + handle2.y);
     line = new Phaser.Line(handle1.x, handle1.y, handle2.x, handle2.y);
     line.source = handle1;
     line.sink = handle2;
     line.last_start_x = -99;
     line.last_end_x = -99;
     line.last_start_y = -99;
     line.last_end_y = -99;
     line.last_end_size = handle1.scale.y;
     line.last_start_size = handle2.scale.y;
     line.dummy = false;
     line.dummyNodes = [];
     line.highlighted = false;
     line.was_highlighted = false;
     links.push(line);
     //console.log("h1");
     //console.log(handle1.rank);
     //console.log("h2");
     //console.log(handle2.rank);
     //console.log(roots());
     bumpRank();
     pruneLinks();
     colorNode(handle2);
     linkGfx = this.game.add.graphics(0, 0);
     line.gfx = linkGfx;
     beziers.push(linkGfx);
     linkLayer.add(linkGfx);
     vLayout();
     //drawLinks();
     return line;
}

function setRank(node) {
    edges = linksin(node)
    oldRank = node.rank;
    //console.log("Node has " + edges.length + " edges");
     if(edges.length > 0) {
          node.rank = 1 + Math.max(...edges.map(function(val) {
               return val.source.rank;
          }));
     } else {
          node.rank = 0;
     } 
     nodeChanged = nodeChanged || (node.rank != oldRank);
}


// Draw over a node to colour it with doneness
function overDrawNode(node) {
     node.blobs.forEach(function(blob) { blob.destroy();});
     node.blobs = [];
     if(node.done) { return;}
     inLinks = linksin(node);
     inLinks.filter(function(link) { return link.source.done;})
     .forEach(function(link){
          end_sizes = ends(link);
          start_height = end_sizes[0];
          end_height = end_sizes[1];
          offset = offsets(link, start_height, end_height, false);
          blob = game.add.sprite(node.x, node.y+offset[1], 'center');
          blob.scale.y = end_height;
          blob.scale.x = nodeWidth;
          // Colour green, take highlight or active from the node
          if(node.tint === colorMap.nodeNotDoneHighlight) {
               blob.tint = colorMap.nodeDoableHighlight;
          } else if (node.active) {
               blob.tint = colorMap.nodeDoableActive;
          } else {
               blob.tint = colorMap.nodeDoable;
          }
          node.blobs.push(blob);
          nodePartLayer.add(blob);
     });
}

function colorBlobs(node) {
     node.blobs.forEach(function(blob) {
          if(node.active) {
               blob.tint = colorMap.nodeDoableActive;
          } else if(node.highlighted) {
               blob.tint = colorMap.nodeDoableHighlight;
          } else {
               blob.tint = colorMap.nodeDoable;
          }
     });
}

function bumpRank() {
     //Start with the tree of incomplete nodes
     var remainingNodes = doneRoots();
     x = 0;
     //console.log("Done");
     //console.log(remainingNodes);
     while (remainingNodes.length) {
          nextNodes = [];
          //console.log("Remaining " + remainingNodes.length);
          remainingNodes.forEach(function(node) {

               //If this node is a target, delay expansion
               if(sinkOfAny(node, remainingNodes)) {
                    //console.log("Delaying.");
               } else {
                    //console.log("Expanding on rank " + x);
                    //console.log("Old rank was " + node.rank);
                    node.rank = x;
                    //console.log("New rank is " + node.rank);
                    linksout(node).forEach(function(link) {
                         if(link.sink.done){
                              nextNodes.push(link.sink);
                         }
                    });
               }
          });
          //console.log("Todo " + nextNodes.length);
          remainingNodes = nextNodes;
          //console.log(remainingNodes);
          x++;
     }
     //Expand the finished ones
     remainingNodes = notDoneRoots();
     //console.log("Not done.");
     //console.log(remainingNodes);
     while (remainingNodes.length) {
          nextNodes = [];
          //console.log("Remaining " + remainingNodes.length);
          remainingNodes.forEach(function(node) {

               //If this node is a target, delay expansion
               if(sinkOfAny(node, remainingNodes)) {
                    //console.log("Delaying.");
               } else {
                    //console.log("Expanding on rank " + x);
                    //console.log("Old rank was " + node.rank);
                    oldRank = node.rank;
                    node.rank = x;
                    //console.log("New rank is " + node.rank);
                    linksout(node).forEach(function(link) {
                         nextNodes.push(link.sink);
                    });
               }
          });
          //console.log("Todo " + nextNodes.length);
          remainingNodes = nextNodes;
          x++;
     }
     depth = x;
     //Shunt any leaves to the right
     nodes.forEach(function(node) {
          if(linksin(node).filter(function(link) { return !link.source.done;}).length) {
               if(!linksout(node).length && !node.done) {
                    node.rank = depth - 1;
               }
          }
     });
     //console.log(nodes.map(function(val) {return val.rank}));
}

function sinkOfAny(nodeA, nodeList) {
     // Is nodeA on the end of a link from any of nodes
     //console.log("Checking " + nodeList.length);
     for(var i = 0; i < nodeList.length; i++) {
          node = nodeList[i];
          if(isTarget(node, nodeA)) {
               return true;
          }
     }
     //console.log("No sinks");
     return false;
}

function isTarget(nodeA, nodeB) {
     // Is nodeB on the end of a link from nodeA.
     for(var i = 0; i < links.length; i++) {
          link = links[i];
          if(Object.is(link.source, nodeA) && Object.is(link.sink, nodeB)) {
               return true;
          }
     }
     return false;
}

function hasLink(handle1, handle2) {
     for(var i = 0; i < links.length; i++) {
          link = links[i];
          if(Object.is(link.source, handle1) && Object.is(link.sink, handle2)) {
               //console.log("Has a link.");
               return true;
          } else if (Object.is(link.source, handle2) && Object.is(link.sink, handle1)) {
               //console.log("Has a link.");
               return true;
          }
     }
     //console.log("No links");
     return false;
}

function linksin(node) {
     return links.filter(function(val) {
          return Object.is(val.sink, node);
     });
}

function linksout(node) {
     return links.filter(function(val) {
          return Object.is(val.source, node);
     });
}

function allLinks(node) {
     return linksin(node).appendAll(linksout(node));
}

// Roots of the graph of nodes not yet done
function notDoneRoots() {
     return nodes.filter(function(node) {return !node.done})
     .filter(function(val) {
          return linksin(val).filter(function(link) {
               return !link.source.done;
          }).length === 0;
     });
}

//Roots of the graph of completed nodes
function doneRoots() {
     return nodes.filter(function(node) {return node.done})
     .filter(function(val) {
          return linksin(val).filter(function(link) {
               return link.source.done;
          }).length === 0;
     });
}

function roots() {
     return nodes.filter(function(val) {
          return linksin(val).length === 0;
     });
}

function checkCycle(node) {
     //console.log("Visiting node of rank " + node.rank);
     if(node.visited) {
          return true;
     }
     //console.log("Visited.");
     node.visited = true;
     cycle = false;
     edges = linksout(node);
     //console.log("Edges");
     //console.log(edges);
     for(var i = 0; i < edges.length; i++) {
          cycle = cycle || checkCycle(edges[i].sink);
     }
     return cycle;
}

function resetVisited() {
     nodes.map(function(val) {
          val.visited = false;
     } );
}

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

function hasPath(start, end) {
     
    tmp_path = [start];
    q = [tmp_path.slice(0)];
   //console.log(q);
    while(q.length != 0) { 
    //console.log("Q:");
    //console.log(q);
         tmp_path = q.shift();
         last_node = tmp_path[tmp_path.length - 1];
        //console.log(tmp_path);
        //console.log(tmp_path.map(function(node){return node.uuid;}));
        //console.log(last_node.uuid);
         if(last_node.uuid === end.uuid) {
               return true;
          }
         linksout(last_node).forEach(function(link) {
                    target = link.sink;
                    if(tmp_path.indexOf(target) === -1) {
                        //console.log("Tmp path ");
                        //console.log(tmp_path);
                         tmp_path.push(target);
                         q.push(tmp_path.slice(0));
                    }
         });
    }
    return false;
}

function isAncestor(child, ancestor) {
    //console.log("Child: " + child.uuid + " " + child.rank);
    //console.log("Ancestor: " + ancestor.uuid + " " + ancestor.rank);
     if(Object.is(child, ancestor)) {
         //console.log("Child is ancestor.");
          return true;
     }
     //Doesn't work quite right
     inChild = linksin(child);
     if(inChild.filter(function(val) {
          return Object.is(val.source, ancestor);
     }).length > 0) {
         //console.log("Direct child.");
          return true;
     }
    //console.log("Entering loop, checking " + inChild.length + " backlinks.");
     for(var i = 0; i < inChild.length; i++) {
         //console.log("Checking backlink..");
         //console.log(inChild[i].source.uuid + " " + inChild[i].source.rank);
          if(isAncestor(inChild[i].source, ancestor)) {
               return true;
          }
     }
    //console.log(child.uuid + " rank " + child.rank + " not ancestor of " + ancestor.uuid);
     return false;
}

function hasCycle() {
     rootNodes = roots();
     for(var i = 0; i < rootNodes.length; i++) {
          resetVisited();
          if(checkCycle(rootNodes[i])) {
               return true;
          }
     }
     return false;
}

function splice(links, node) {
     sources = links.filter(function(link) { return link.sink.uuid === node.uuid});
     sinks = links.filter(function(link) { return link.source.uuid === node.uuid});
     sources = sources.map(function(link) { return link.source;});
     sinks = sinks.map(function(link) {return link.sink;});
     //console.log("Splicing between " + sources.length + " sources & " + sinks.length + " sinks.");
     sources.forEach(function(source) {
          sinks.forEach(function(sink) {
               //console.log("splicing.. " + source.uuid + " to " + sink.uuid);
               linkToFirebase(makeLink(source, sink));
          });
     });
}

function buttonTap(button, pointer, isDoubleClick) {
     nodeTap(button.node, pointer, isDoubleClick);
}
function textTap(text, pointer) {
     node = nodes.filter(function(node) { return Object.is(node.text, text);}).pop();
     showModal(node);
}

function showModal(node) {
     $('#exampleModal').off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
          console.log("Closed.");
          console.log($('#todo-name').val());
          node.text.setText($('#todo-name').val());
          node.notes = $('#todo-text').val();
          node.length = $('#todo-length').val();
          resizeNode(node);
          vLayout();
          updateNode(node);
          game.input.keyboard.start();
     });
     game.input.keyboard.stop();
     $('#exampleModal').modal();
     console.log("Initial node text is " + node.text.text);
     $('#todo-name').val(node.text.text);
     $('#todo-text').val(node.notes);
     $('#todo-length').val(node.length);
}

function isDoable(node) {
     return linksin(node).filter(function(link) { return !link.source.done;}).length === 0;
}

function colorNode(n) {
     if(n.active) {
          if(n.done) {
               n.tint = colorMap.nodeDoneActive;
          } else if(isDoable(n)) {
               n.tint = colorMap.nodeDoableActive;
          } else {
               n.tint = colorMap.nodeNotDoneActive;
          }
     } else if (n.highlighted) {
          highLightNode(n);
     } else {
          if(n.done) {
               n.tint = colorMap.nodeDone;
          } else if(isDoable(n)) {
               n.tint = colorMap.nodeDoable;
          } else {
               n.tint = colorMap.nodeNotDone;
          }
     }
     colorBlobs(n);
}

function highLightNode(node) {
     if(node.done) {
          node.tint = colorMap.nodeDoneHighlight;
     } else if(isDoable(node)) {
          node.tint = colorMap.nodeDoableHighlight;
     } else {
          node.tint = colorMap.nodeNotDoneHighlight;
     }
     colorBlobs(node);
}

//Dim nodes that don't lead to this one
function nodeTap(node, pointer) {
          wasActive = node.active;
          nodes.forEach(function(n) {
               n.active = false;
               n.highlighted = false;
               //highLightNode(n);
          });
          node.active = !wasActive;
          if(node.active) {
               if(node.done) {
                    ancestors = nodes.filter(function(n) {
                                  //console.log("Starting check for " + n.uuid);
                                  //console.log("Kinder suprise " + node.uuid);
                                   return hasPath(node, n);
                              });
                    ancestors.forEach(function(n) {
                         n.highlighted = true;
                    });
               } else {
                              ancestors = nodes.filter(function(n) {
                                  //console.log("Starting check for " + n.uuid);
                                  //console.log("Kinder suprise " + node.uuid);
                                   return hasPath(n, node);
                              });
                              ancestors.forEach(function(n) {
                                   n.highlighted = true;
                              });
                    }
          }
          nodes.forEach(colorNode);
}

function nodeHeight(node) {
     return Math.max(linksin(node).length, linksout(node).length);
}

function resizeNode(node) {
     height = Math.max(node.length*baseNodeHeight, baseNodeHeight);
     node.scale.y = height;
}

function offsets(link, start_height, end_height, future) {
     start = link.source;
     end = link.sink;
     in_nodes  = linksin(end).filter(function(link){return !link.dummy;}).map(function(l) { 
          if(l.dummyNodes.length) {
               source = l.dummyNodes[l.dummyNodes.length - 1];
               return source;
          }
          return l.source;
          });
     in_nodes = in_nodes.sort(function(a, b) {
          if(future) {return a.pos - b.pos;}
          return a.y - b.y;
     });
     if(link.dummyNodes.length) {
          end_offset = in_nodes.indexOf(link.dummyNodes[link.dummyNodes.length - 1]);
     } else {
          end_offset = in_nodes.indexOf(start);
     }
     //Unless there's a dummy for it
     out_nodes  = linksout(start).filter(function(link){return !link.dummy;}).map(function(l) { 
          if(l.dummyNodes.length) {
               return l.dummyNodes[0];
          }
          return l.sink;});
     out_nodes = out_nodes.sort(function(a, b) {
          if(future) {return a.pos - b.pos;}
          return a.y - b.y;
     });
     if(link.dummyNodes.length) {
          start_offset = out_nodes.indexOf(link.dummyNodes[0]);
     } else {
          start_offset = out_nodes.indexOf(end);
     }
     return [start_offset*start_height, end_offset*end_height];
}

function ends(link) {
     start = link.source;
     end = link.sink; 
     n_out = linksout(start).filter(function(link){return !link.dummy;}).length;
     n_in = linksin(end).filter(function(link){return !link.dummy;}).length;
     return [start.scale.y/n_out, end.scale.y/n_in];
}

function dirtyLink(link) {
     startNode = link.source;
     endNode = link.sink;
     clean = link.last_start_x == startNode.x;
     clean = clean && (link.last_end_x == endNode.x);
     clean = clean && (link.last_start_y == startNode.y);
     clean = clean && (link.last_end_y == endNode.y);
     clean = clean && (link.last_start_size == startNode.scale.y);
     clean = clean && (link.last_end_size == endNode.scale.y);
     link.last_start_x = startNode.x;
     link.last_end_x = endNode.x;
     link.last_start_y = startNode.y;
     link.last_end_y = endNode.y;
     link.last_end_size = endNode.scale.y;
     link.last_start_size = startNode.scale.y;
     return !clean;
}

function drawLinks() {
     beziers.forEach(function(bezierGraphics, ix, array){
          link = links[ix];
          link.was_active = link.active;
          link.was_highlighted = link.highlighted;
          link.highlighted = false;
          link.active = false;
          try {
               if(link.poly.contains(game.input.x, game.input.y)) {
                    link.active = true;
               }
               link.highlighted = link.sink.highlighted || link.sink.active;
               link.highlighted = link.highlighted && link.source.highlighted;
               link.highlighted = link.highlighted && !link.source.done;
          } catch(err) {}
          activeChange = link.was_active || link.active || link.highlighted || link.was_highlighted;

          if(dirtyLink(link) || activeChange){
               bezierGraphics.clear();
                    //polys[i].clear();
                    startNode = link.source;
                    endNode = link.sink;
                    
                    if(link.highlighted) {
                         bezierGraphics.lineStyle(1, 0xffffff);
                    } else {
                         bezierGraphics.lineStyle(0);
                    }

                    if(link.sink.done) {
                        if(link.active) {
                              bezierGraphics.beginFill(colorMap.linkHoverDoneDone, 0.5);
                         } else {
                              bezierGraphics.beginFill(colorMap.linkDoneDone, 0.5);
                         } 
                    } else if(link.source.done) {
                        if(link.active) {
                              bezierGraphics.beginFill(colorMap.linkHoverDone, 0.5);
                         } else {
                              bezierGraphics.beginFill(colorMap.linkDone, 0.5);
                         } 
                    } else {
                         if(link.active) {
                              bezierGraphics.beginFill(colorMap.linkHover, 0.5);
                         } else {
                              bezierGraphics.beginFill(colorMap.link, 0.5);
                         }
                    }
                    //bezierGraphics.moveTo(startNode.x + 50, startNode.y + offset[0]);
                    poly = linkPoly(link, false);
                    link.poly = poly;
                    bezierGraphics.drawPolygon(poly.points);
                    overDrawNode(link.sink);
                    //bezierGraphics.lineTo(x_points[0], y_points[0]);
                    //bezierGraphics.endFill();
               }

     });
}

function linkPoly(link, future) {
     startNode = link.source;
     endNode = link.sink;
     end_sizes = ends(link);
     start_height = end_sizes[0];
     end_height = end_sizes[1];
     if(future){
          startNode.y_now = startNode.y
          startNode.y = startNode.pos;
          endNode.y_now = endNode.y;
          endNode.y = endNode.pos;
          startNode.x_now = startNode.x;
          startNode.x = startNode.rank*hPad;
          endNode.x_now = endNode.x;
          endNode.x = endNode.rank*hPad;
     }
     offset = offsets(link, start_height, end_height, future);
     midpoint = {x:(endNode.x + startNode.x)*0.5,
          y:(endNode.y + startNode.y  + offset[0]  + offset[1])*0.5};
     x_points = [];
     y_points = [];
     x_back = [];
     y_back = [];
     for (var i=0; i<1; i+=0.25){
          xs = [startNode.x + nodeWidth];
          if(link.dummyNodes.length) {
               link.dummyNodes.forEach(function(dummy) {
                    xs.push(dummy.x);
                    xs.push(dummy.x+nodeWidth);
               });
          } else {
               xs.push(midpoint.x); 
               xs.push(midpoint.x);
          }
          xs.push(endNode.x);
          var px = Phaser.Math.bezierInterpolation(xs, i);
          ys = [startNode.y  + offset[0]];
          if(link.dummyNodes.length) {
               link.dummyNodes.forEach(function(dummy) {
                    ys.push(dummy.pos);
                    ys.push(dummy.pos);
               });
          } else {
               ys.push(startNode.y  + offset[0]); 
               ys.push(endNode.y  + offset[1]);
          }
          ys.push(endNode.y  + offset[1]);
          var py = Phaser.Math.bezierInterpolation(ys, i);
          x_points.push(px);
          y_points.push(py);


          px = Phaser.Math.bezierInterpolation(xs, i);

          ys = [startNode.y  + offset[0] + start_height];
          if(link.dummyNodes.length) {
               link.dummyNodes.forEach(function(dummy) {
                    ys.push(dummy.pos + dummy.scale.y);
                    ys.push(dummy.pos + dummy.scale.y);
               });
          } else {
               ys.push(startNode.y  + offset[0] + start_height); 
               ys.push(endNode.y  + offset[1] + end_height);
          }
          ys.push(endNode.y  + offset[1] + end_height);

          py = Phaser.Math.bezierInterpolation(ys, i);
          x_back.push(px);
          y_back.push(py);
     }
     x_points.push(endNode.x);
     y_points.push(endNode.y  + offset[1]);
     x_back.push(endNode.x);
     y_back.push(endNode.y  + offset[1] + end_height);
     poly_point = [new Phaser.Point(startNode.x + nodeWidth, startNode.y + offset[0])];
     for(var i = 0; i < x_points.length; i++) {
          poly_point.push(new Phaser.Point(x_points[i], y_points[i]));
     }
     for(var i = x_points.length; i > 0; i--) {
          poly_point.push(new Phaser.Point(x_back[i - 1], y_back[i - 1]));
     }
     poly_point.push(new Phaser.Point(x_points[0], y_points[0]));
     poly = new Phaser.Polygon(poly_point);
     if(future){
          startNode.y = startNode.y_now;
          endNode.y = endNode.y_now;
     }
     poly.startRank = startNode.rank;
     poly.endRank = endNode.rank;
     return poly;
}

function center(node) {
     return (node.x + node.scale.y)/2;
}

function fixOverlaps(nodes) {
     y0 = 0;
     //move down overlaps
     nodes.forEach(function(node, ix){
          dy = y0 - node.pos;
          if (dy > 0) node.pos += dy;
          y0 = node.pos + node.scale.y + 25;
     });
     //Move up out of bound nodes
     y_max = window.innerHeight;

     dy = y0 - 25 - y_max;
     //console.log("dy "+dy);
        if (dy > 0) {
          //console.log("Moving back up.");
          y0 = node.pos -= dy;
          // Push any overlapping nodes back up.
          nodes.reverse().forEach(function(node) {
            dy = node.pos + node.scale.y + 25 - y0;
            if (dy > 0) node.pos -= dy;
            y0 = node.pos;
          });
        }
}

function median(values) {
     if(!values.length) { return 0;}

    values.sort( function(a,b) {return a - b;} );

    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
}

function bary(values) {
     if(!values.length) { return 0;}
     return values.reduce(function(a, b) { return a + b}, 0)/values.length;
}

function medianLayout() {
     stepPolys.forEach(function(poly){
          poly.clear();
          poly.destroy();
     });
     nodes.forEach(function(node) {
          node.pos = 0;
          node.ix = 0;
     });
     ranks = []
     links.forEach(function(link) {
          link.dummyNodes = [];
     });
     // Work left to right
     for(var rank = 0; rank < depth; rank++) {
          //Nodes on this rank
          thisRank = nodes.filter(function(node) { return node.rank === rank;});
          //Insert dummies
          bypass = [];
          if(rank > 0) {
               //console.log("Checking bypass.")
               //Nodes on ranks below
               below = nodes.filter(function(node) { return node.rank < rank;});
               //Links to nodes above
               bypass = links.filter(function(link) {
                    return below.indexOf(link.source) != -1 && link.sink.rank > rank;
               });
               //Add a dummy node & dummy link for each bypass
               bypass.forEach(function(link) {
                    dummy = {pos:0,dummy:true, x:rank*hPad,rank:rank,scale:{y:baseNodeHeight}};
                    dummy.ix = bary(linksin(link.sink).filter(function(l){return !l.dummy;}).map(function(l) {return l.source.ix;}));
                    //console.log("Dummy height: " + dummy.scale.y);
                    // This messes up the median with multiple links!
                    //All dummies for a node should get the same ix later
                    thisRank.push(dummy);
                    dummyLink = {source:link.source, sink:dummy, dummy:true, dummy_for:link};
                    link.dummyNodes.push(dummy);
                    links.push(dummyLink);
                    dummyLink = {source:dummy, sink:link.sink, dummy:true, dummy_for:link};
                    links.push(dummyLink);
               });
               //console.log("Added " + bypass.length + " dummies");
          }
          //Get the median order of each node's parent
          thisRank.forEach(function(node) {
               if(!node.dummy) {
                    into = linksin(node).map(function(link) {return link.source.ix;});
                    node.ix = bary(into);
               }
          });
          //Position in order
          thisRank.sort(function(a, b) { return a.ix - b.ix});
          thisRank.forEach(function(n, ix) { n.ix = ix;});
          layoutRank(thisRank);
          ranks.push(thisRank);
          dummies = thisRank.filter(function(node) { return node.dummy});
          dummies.forEach(function(dummy) {
          //console.log("Drawing dummy.");
          //dummyGfx = this.game.add.graphics(0, 0);
          //stepPolys.push(dummyGfx);
          //dummyGfx.lineStyle(2, 0x6f60ff, 1);
          //dummyGfx.drawRect(dummy.rank*hPad, dummy.pos, nodeWidth, baseNodeHeight);
     });
     }
     for(var rank = depth - 1; rank >= 0; rank--) {
          //Nodes on this rank
          thisRank = ranks[rank];//nodes.filter(function(node) { return node.rank === rank;});
          
          //Get the median order of each node's parent
          thisRank.forEach(function(node) {
               into = linksout(node).map(function(link) {return link.sink.ix;});
               //console.log(rank + " " + node.ix + " " + node.dummy);
               node.ix = bary(into);
               //console.log(rank + " " + node.ix);
          });
          //Position in order
          thisRank.sort(function(a, b) { return a.ix - b.ix});
          thisRank.forEach(function(n, ix) { n.ix = ix;});
          layoutRank(thisRank);
     }
     ranks.forEach(function(rank, ix) {
          permute(rank, ranks, ix);
     });
     links = links.filter(function(link) {return !link.dummy});
     nodes = nodes.filter(function(node) { return !node.dummy});
     //Tween into place.
     nodes.forEach(function(node) {
          var rebound = game.add.tween(node);
          rebound.to({y: node.pos, x:node.rank*hPad}, 1000, Phaser.Easing.Elastic.Out);
          rebound.start(); 
          rebound = game.add.tween(node.text);
          rebound.to({y: node.pos + node.scale.y/4, x:node.rank*hPad + nodeWidth}, 1000, Phaser.Easing.Elastic.Out);
          rebound.start();
          rebound = game.add.tween(node.button);
          rebound.to({y: node.pos+baseNodeHeight/4, x:node.rank*hPad+nodeWidth/4}, 1000, Phaser.Easing.Elastic.Out);
          rebound.onComplete.add(function() {
          for(var i = 0; i < links.length; i++) {
               line = links[i];
               if(Object.is(line.source, node)) {
                    link.dirty = false;
                    line.fromSprite(line.source, line.sink, false);
               } else if(Object.is(line.sink, node)) {
                    link.dirty = false;
                    line.fromSprite(line.source, line.sink, false);
               }
          }}, this);
          rebound.start(); 
     });
}

function scrollNow() {
     nodeXs = nodes.filter(function(node) { return !node.done;}).map(function(node) { return node.rank*hPad;});
     if(nodeXs.length) {
          game.camera.x = Math.min(...nodeXs);
     } else {
          nodeXs = nodes.map(function(node) { return node.rank*hPad;});    
          game.camera.x = Math.max(...nodeXs);
     }
}

function scrollFinally() {
     nodeXs = nodes.map(function(node) { return node.rank*hPad;});
     nodeXs.push(0);
     game.camera.x = Math.max(...nodeXs);
}

function scrollThen() {
     game.camera.x = 0;
}

function layoutRank(rank) {
     pos = -25;
     rank.forEach(function(node, ix) {
               //pad
               pos += 25;
               node.pos = pos;
               //Offset by this node's height
               pos += node.scale.y;
          });
     midpoint = (rank[0].pos + rank[rank.length-1].pos + rank[rank.length-1].scale.y)/2;
     shunt = (window.innerHeight/2)-midpoint;
     rank.forEach(function(node, ix) {
               //pad
               node.pos += shunt;
               //Offset by this node's height
               if(node.dummy) {
                    node.y = node.pos;
               }
          });

}

function permute(rank, ranks, rankNum) {
     //console.log(rank);
     improved = false;
     ranks.forEach(function(r) {layoutRank(r)});
     bootstrap = false;
     if(rankNum === 0) { bootstrap = true; rankNum++; }
     linkPolys = links.filter(function(link){return !link.dummy;}).map(function(link) { 
          l = linkPoly(link, true);
          l.changed = true;
          return l;});
     nCross = countCrossings(linkPolys, rankNum);
     for(var i = 0; i < rank.length; i++) {
               //console.log(rank.map(function(n) {return n.uuid;}));
               tmp = rank[i];
               ixup = (i + 1) % rank.length;
               rank[i] = rank[ixup];
               rank[i].ix = i;
               rank[ixup] = tmp;
               rank[ixup].ix = ixup;
               //console.log("Swap " + rank[i].dummy + " " + rank[ixup].dummy);
               //console.log(rank.map(function(n) {return n.uuid;}));
               if(bootstrap) {
                    ranks.forEach(function(r) {layoutRank(r)});
               } else {
                    layoutRank(rank);
               }
               //console.log("Layed out");
               linkPolys = links.filter(function(link){return !link.dummy;}).map(function(link, ix) { 
                    //Get the link polygon
                    l = linkPoly(link, true);
                    //Initially unchanged
                    l.changed = false;
                    //Mark as changed if a source or sink of either side of the swap
                    if((link.sink.uuid === rank[i].uuid) || (link.sink.uuid === rank[ixup].uuid)) {
                         l.changed = true;
                    }
                    if(bootstrap && ((link.source.uuid === rank[i].uuid) || (link.source.uuid === rank[ixup].uuid))) {
                         l.changed = true;
                    }
                    return l;});
               tmpCross = countCrossings(linkPolys, rankNum);
               //console.log("New crosscount " + tmpCross + " vs " + nCross);
               //console.log("Diff " + (nCross - tmpCross));
               if(tmpCross < nCross) {
                    nCross = tmpCross;
                    improved = true;
               } else {
                    //console.log("Swapping back.");
                    tmp = rank[i];
                    rank[i] = rank[ixup];
                    rank[i].ix = i;
                    rank[ixup] = tmp;
                    rank[ixup].ix = ixup;
               }
     }
     layoutRank(rank);
     return improved;
}

function vLayout() {
     medianLayout();
     return;
}

function countCrossings(polys, rankNum) {
     area = 0;
     turfPolys = polys.map(function(poly){return toTurf(poly);});
     //console.log("turfPolys");
     //console.log(turfPolys);

     //Check a poly against same rank, or spanning that rank
     //Don't double count
     //Check the rank *up* as well?
     checks = 0;
     skips = 0;
     turfPolys.forEach(function(poly) {
          others = turfPolys.forEach(function(other) {
               //Same rank
               test = other.properties.startRank <= poly.properties.startRank;

               //Or same end rank
               test = test || (other.properties.endRank >= poly.properties.endRank);

               //Or crosses this rank
               //test = test || ((other.properties.startRank < poly.properties.startRank) && (other.properties.endRank > poly.properties.endRank));

               //But isn't this poly
               test = test && !Object.is(other, poly);

               //And hasn't been tested against it
               test = test && (other.properties.checkAgainst.indexOf(poly) == -1);

               //And that ends on this rank
               //test = test && (poly.endRank  == rankNum);

               //And has been moved
               //test = test && poly.properties.changed;
               
               if(test) {
                    other.properties.checkAgainst.push(poly);
                    poly.properties.checkAgainst.push(other);
                    area += intersectArea(poly, other);
                    checks++;
               } else {
                    skips++;
               }
          });

     });
     //console.log(checks + " polychecks, " + skips + " skips. Rank: " + rankNum);
     return area;
}

function polyPolyIntersect(polyA, polyB) {
     for(var i = 0; i < polyA.length; i++) {
          if(linePolyIntersect(polyA[i], polyB)) {
               return true;
          }
     }
     return false;
}

function linePolyIntersect(line, poly) {
     for(var i = 0; i < poly.length; i++) {
          if(line.intersects(poly[i])) {
               return true;
          }
     }
     return false;
}

function fixLocation(item) {
     var rebound = game.add.tween(item);
     rebound.to({x: item.rank*hPad, y:item.pos}, 1000, Phaser.Easing.Elastic.Out);
     rebound.start(); 
     var rebound = game.add.tween(item.button);
     rebound.to({x: item.rank*hPad + nodeWidth/4, y:item.pos + baseNodeHeight/4}, 1000, Phaser.Easing.Elastic.Out);
     rebound.start(); 
     rebound = game.add.tween(item.text);
     rebound.to({x: item.rank*hPad + nodeWidth, y:item.pos + item.scale.y/4}, 1000, Phaser.Easing.Elastic.Out);
     rebound.start();
}

function intersectArea(polyA, polyB) {
     var intersection = turf.intersect(polyA, polyB);
     var area;

     if(typeof intersection === "undefined") {
          area = 0;
     } else {
          area = turf.area(intersection);
     }
     return area;
}

function polyPointsString(poly) {
     str = "[[";
     poly.geometry.coordinates[0].forEach(function(coord) {
          str += "[";
          str += coord[0]*0.01;
          str += ",";
          str += coord[1]*0.01;
          str += "],";
     });
     str += "]]";
     return str;
}

function toTurf(poly) {
     points = poly.toNumberArray();
     lineSet = [];
     for(var i = 0; i < points.length - 1; i+=2) {
          lineSet.push([points[i], points[i+1]]);
     }
     var poly1 = {
          "type": "Feature",
          "properties": {
               "fill": "#0f0",
               "startRank": poly.startRank,
               "endRank": poly.endRank,
               "checkAgainst": [],
               changed: poly.changed
          },
          "geometry": {
               "type": "Polygon",
               "coordinates": [lineSet]
          }
     }
     return poly1;
}

function addNode(force){
     freeSpace = !over(buttons) && !over(nodes) && !over(nodes.map(function(node) {return node.text;}));
     //console.log(freeSpace);
     if(freeSpace || force){
          x = game.input.x - nodeWidth;
          y = game.input.y - baseNodeHeight;
          node = createNode(x, y);
          colorNode(node);
          console.log("New node, text is " + node.text.text);
          button = createButton(x, y);
          node.button = button;
          node.edges = [];
          button.node = node;
          buttons.push(button);
          nodes.push(node);
          console.log("New node, text is " + node.text.text);
          //bumpRank();
          console.log("New node, text is " + node.text.text);
          //console.log(nodes);
          vLayout();
          console.log("New node, text is " + node.text.text);
          showModal(node);
          nodeToFirebase(node);
          return node;
     }
}

function bezierPoint(p0, p1, p2, p3, t){
     var cX = 3 * (p1.x - p0.x);
     var bX = 3 * (p2.x - p1.x) - cX;
     var aX = p3.x - p0.x - cX - bX;
     var cY = 3 * (p1.y - p0.y);
     var bY = 3 * (p2.y - p1.y) - cY;
     var aY = p3.y - p0.y - cY - bY;
     var x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
     var y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;
     return {x: x, y: y};     
}