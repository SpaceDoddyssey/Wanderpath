class GraphElement {
    constructor(id) {
        this.timesCrossed = 0;
        this.maxCrosses = maxCrosses;

        this.numberRestraint = -1;
        this.totalRestraints = 0;

        this.ID = id;
    }

    restraintsSatisfied(){
        if ((this.numberRestraint == -1) || (this.timesCrossed == this.numberRestraint)){
            return true
        } 
        if(restraintDebug) { 
            console.log("Node " + this.ID + " restraint not satisfied, crossed ", this.timesCrossed, " times instead of ", this.numberRestraint);
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

        return this.timesCrossed < this.maxCrosses;
    }
}