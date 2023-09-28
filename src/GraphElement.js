class GraphElement {
    constructor(id) {
        this.timesCrossed = 0
        this.maxCrosses = maxCrosses

        this.numberRestraint = -1;
        this.totalRestraints = 0;

        this.ID = id
    }

    restraintsSatisfied(){
        if ((this.numberRestraint == -1) || (this.timesCrossed == this.numberRestraint)){
            return true
        } else {
            if(restraintDebug) { 
                console.log("Node " + this.ID + " restraint not satisfied, crossed ", this.timesCrossed, " times instead of ", this.numberRestraint) }
        }
    }

    uncross(){
        if(this.timesCrossed > 0){
            this.timesCrossed--;
        }
    }

    cross(){
        if(!this.canCross()) {
            return false
        } 
        this.timesCrossed++;
        return true;
    }

    canCross(){
        if (this.numberRestraint != -1 && this.timesCrossed == this.numberRestraint){
            return false
        }

        if(this.timesCrossed < this.maxCrosses){
            return true
        } else {
            return false
        }
    }

    //This is probably unnecessary, I briefly thought it might be.
    //Might as well keep it here in case it becomes useful
    // static dirBetween(from, to){
    //     let fromLoc = from.GridLoc();
    //     let toLoc = to.GridLoc();
    //     if (!fromLoc || !toLoc){
    //         console.log("dirBetween called with invalid nodes")
    //         return;
    //     }
        
    //     let xDelta = toLoc[0] - fromLoc[0];
    //     let yDelta = toLoc[1] - fromLoc[1];

    //     //If the two nodes are not adjacent, there's a problem
    //     if (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1 || xDelta + yDelta == 0){
    //         console.log("dirBetween called on non-adjacent nodes")
    //     } 
    // }
}