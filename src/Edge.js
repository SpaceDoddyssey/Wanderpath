class Edge extends GraphElement {
    constructor(ANode, BNode, id) {
        super(id);
        
        [this.ANode, this.BNode] = [ANode, BNode];
        
        this.elementType = "Edge"

        this.oneWayRestraint = false;
        this.canCrossAtoB = true;
        this.canCrossBtoA = true;
        this.numTimesCrossedAtoB = 0;
        this.numTimesCrossedBtoA = 0;
    }

    reset(){
        this.timesCrossed = 0;
        this.numberRestraint = -1;
        this.totalRestraints = 0;
        this.oneWayRestraint = false;
        this.canCrossAtoB = true;
        this.canCrossBtoA = true;
        this.numTimesCrossedAtoB = 0;
        this.numTimesCrossedBtoA = 0;
    }

    ScreenLoc(){
        let ANodeLoc = this.ANode.ScreenLoc();
        let BNodeLoc = this.BNode.ScreenLoc();
        let x = (ANodeLoc[0] + BNodeLoc[0]) / 2
        let y = (ANodeLoc[1] + BNodeLoc[1]) / 2
        return [x, y]
    }

    addRestraints(){
        if(this.numberRestraint == -1){
            this.numberRestraint = this.timesCrossed;
            this.totalRestraints++;
        }

        this.canCrossAtoB = !(this.numTimesCrossedAtoB == 0 && this.numTimesCrossedBtoA != 0);
        this.canCrossBtoA = !(this.numTimesCrossedAtoB != 0 && this.numTimesCrossedBtoA == 0);
        this.oneWayRestraint = !this.canCrossAtoB || !this.canCrossBtoA;
        hasOneWayStreets = true;
        this.totalRestraints++;
    }

    restraintsSatisfied(){
        if ((this.numberRestraint != -1) && (this.timesCrossed != this.numberRestraint)){
            if (restraintDebug){ 
                console.log("Edge " + this.ID + " number restraint not satisfied, crossed ", this.timesCrossed, " times instead of ", this.numberRestraint) }
            return false;
        }

        if (this.oneWayRestraint && this.timesCrossed == 0){
            if(restraintDebug) { console.log("One way not satisfied on edge " + this.ID); }
            return false;
        }

        return true;
    }

    cross(sourceNode){
        if(!this.canCross(sourceNode)) {
            return false
        } 

        this.timesCrossed++;
        if(sourceNode == this.ANode){
            this.numTimesCrossedAtoB++;
        } else if (sourceNode == this.BNode){
            this.numTimesCrossedBtoA++;
        } else {
            if (edgeCrossDebug) { console.log("cross called on edge " + this.id + " with invalid node!"); }
            return false;
        }

        return true;
    }

    uncross(sourceNode){
        if(sourceNode == this.ANode){
            this.numTimesCrossedAtoB--;
        } else if (sourceNode == this.BNode){
            this.numTimesCrossedBtoA--;
        } else {
            if (edgeCrossDebug) { console.log("uncross called on edge " + this.id + " with invalid node!"); }
            return false;
        }

        this.timesCrossed--;
    }

    canCross(sourceNode){ //Can you cross this edge starting at the given node
        //If the edge is full up to numberRestraint, no
        if (this.numberRestraint != -1 && this.timesCrossed == this.numberRestraint){
            return false
        }
        //If the edge is full up to maxCrosses, no
        if(this.timesCrossed == this.maxCrosses){
            return false
        }
        //If the source node is not one of the attached nodes, no, obviously (this should never happen)
        if(sourceNode != this.ANode && sourceNode != this.BNode){
            if(edgeCrossDebug) { console.log("canCross called on edge " + this.id + " with invalid node!") }
            return false;
        }
        //If there's a one way restraint and we would be crossing it the wrong way, no
        if(this.oneWayRestraint) {
            if(this.canCrossBtoA == false && sourceNode == this.BNode){
                return false;
            } else if (this.canCrossAtoB == false && sourceNode == this.ANode){
                return false;
            }
        }
        //Otherwise yes
        if(edgeCrossDebug) { console.log("    edge:cancross: YES"); }
        return true;
    }

    otherNode(node){
        if(node == this.ANode) return this.BNode
        if(node == this.BNode) return this.ANode
        console.log("otherNode called with invalid node")
        return
    }

    drawEdge(graphics){
        let [ALoc, BLoc] = [this.ANode.ScreenLoc(), this.BNode.ScreenLoc()];

        //First draw the base line
        let color = this.timesCrossed > 0 ? 0xFF0000 : 0xFFFFFF;
        graphics.lineStyle(edgeWidth, color, 1.0);
        
        graphics.beginPath();
        graphics.moveTo(...ALoc);
        graphics.lineTo(...BLoc);
        graphics.stroke();
    }
}