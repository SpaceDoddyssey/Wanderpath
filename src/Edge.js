class Edge extends GraphElement {
    constructor(ANode, BNode, id) {
        super(id);
        
        this.ANode = ANode;
        this.BNode = BNode;
        
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
        //This will be more complicated once other types of restraints are added
        if(this.numberRestraint == -1){
            this.numberRestraint = this.timesCrossed;
            this.totalRestraints++;
        }

        this.canCrossAtoB = true;
        this.canCrossBtoA = true;
        if((this.numTimesCrossedAtoB == 0) && (this.numTimesCrossedBtoA != 0)){ 
            this.canCrossAtoB = false; 
            this.oneWayRestraint = true;
            hasOneWayStreets = true;
            this.totalRestraints++;
        } else 
        if ((this.numTimesCrossedAtoB != 0) && (this.numTimesCrossedBtoA == 0)){
            this.canCrossBtoA = false;
            this.oneWayRestraint = true;
            hasOneWayStreets = true;
            this.totalRestraints++;
        }
    }

    restraintsSatisfied(){
        if ((this.numberRestraint != -1) && (this.timesCrossed != this.numberRestraint)){
            console.log("Edge " + this.ID + " number restraint not satisfied, crossed ", this.timesCrossed, " times instead of ", this.numberRestraint)
            return false;
        }

        if (this.oneWayRestraint && this.timesCrossed == 0){
            console.log("One way not satisfied on edge " + this.ID)
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
            console.log("cross called on edge " + this.id + " with invalid node!");
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
            console.log("uncross called on edge " + this.id + " with invalid node!");
            return false;
        }

        this.timesCrossed--;
    }

    canCross(sourceNode){ //Can you cross this edge starting at the given node
        //If the edge is full up to numberRestraint, no
        //console.log("    edge:cancross: src=" + sourceNode.ID + ", ANode=" + this.ANode.ID + ", BNode=" + this.BNode.ID + ", canAtoB=" + this.canCrossAtoB + ", canBtoA=" + this.canCrossBtoA );
        if (this.numberRestraint != -1 && this.timesCrossed == this.numberRestraint){
            return false
        }
        //If the edge is full up to maxCrosses, no
        if(this.timesCrossed == this.maxCrosses){
            return false
        }
        //If the source node is not one of the attached nodes, no, obviously (this should never happen)
        if(sourceNode != this.ANode && sourceNode != this.BNode){
            console.log("canCross called on edge " + this.id + " with invalid node!")
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
        //console.log("    edge:cancross: YES");
        return true;
    }

    otherNode(node){
        if(node == this.ANode) return this.BNode
        if(node == this.BNode) return this.ANode
        console.log("otherNode called with invalid node")
        return
    }
}