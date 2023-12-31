class Path {
    constructor(){
        this.startNode = null;
        this.edgeList = [];
        this.nodeList = [];
        this.dirsTravelled = [Dirs.Endpoint]

        this.allDirs = [Dirs.Up, Dirs.Down, Dirs.Left, Dirs.Right]
    }

    generate(nodes){
        let invalid = true
        let counter = 0;
        while(invalid){
            counter++
            if(counter == 1000){
                console.log("Invalid puzzle settings")
                return false
            }

            this.edgeList = [];
            this.nodeList = [];
    
            invalid = false
            let curNode = Phaser.Math.RND.pick(nodes);
            //console.log("Selected starting node ", curNode.x, ", ", curNode.y)

            curNode.endPoint = true;
            endNode1 = curNode;
            this.maxLength = maxLength;

            curNode.cross()
            this.startNode = curNode;

            this.nodeList.push( curNode );
            let validPath = this.recursivePath(curNode);

            if(!validPath){
                console.log("No valid path found!")
                this.startNode = null
                curNode.endPoint = false
                curNode.uncross()
                invalid = true
            }
        }
        if(finalPathDebug){
            console.log("Path finished: EDGES: " + this.edgeList.map(edge => edge.ID));
            console.log("Path finished: NODES: " + this.nodeList.map(node => node.ID));
        }
        return true;
    }
    
    //Recursively moves in a random direction, pushing edges to the path, backing up if it can't move
    recursivePath(node){
        //Iterate through the directions randomly
        let validDirs = [... this.allDirs]
        rand.shuffle(validDirs);

        //Check each edge 
        let selectedEdge = null;
        for(let i = 0; i < 4; i++) {
            let curDir = validDirs[i];
            
            //If we've already found an edge, or this is the direction we came from, skip
            if(selectedEdge) continue
            let inverseDir = InverseDirs[this.dirsTravelled[this.dirsTravelled.length-1]];
            if(curDir == inverseDir) continue

            //If there's no edge in that direction, skip
            let edge = node.edges[curDir]
            if (edge == null) { continue }  

            //If the edge in that direction, or the node it leads to, can't be crossed, skip
            let otherNode = edge.otherNode(node);
            let edgeCrossable = edge.canCross(node);
            let nodeCrossable = otherNode.canCross();
            if(!edgeCrossable || !nodeCrossable) continue

            //As far as we can tell from here this edge is valid, so let's cross it
            selectedEdge = edge;
            edge.cross(node);
            otherNode.cross()
            this.dirsTravelled.push(curDir);
            this.edgeList.push(edge)
            this.nodeList.push(otherNode)
            //console.log("Travelling " + dirNames[curDir]);

            //If we're at the desired distance, we're all done
            if(this.edgeList.length == this.maxLength){
                let finalNode = otherNode
                this.dirsTravelled.push(curDir);
                finalNode.endPoint = true
                endNode2 = finalNode
                return true
            } 
    
            //We still have edges to go, so keep looking
            let doesNotLeadToDeadEnd = this.recursivePath(otherNode); 
            if (doesNotLeadToDeadEnd) {
                return true
            }
            
            selectedEdge.uncross(node)
            otherNode.uncross()
            this.dirsTravelled.pop()
            selectedEdge = null
            this.edgeList.pop()
            this.nodeList.pop()
            continue
        }

        //If we're at this point either we've finished or we've hit a dead end and need to backtrack
        return (selectedEdge != null)      
    }
}