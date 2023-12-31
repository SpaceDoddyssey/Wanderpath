class Edge extends GraphElement {
    constructor(ANode, BNode, id) {
        super(id);
        
        [this.ANode, this.BNode] = [ANode, BNode];
        
        this.elementType = "Edge"

        this.canCrossAtoB = true;
        this.canCrossBtoA = true;
        this.numTimesCrossedAtoB = 0;
        this.numTimesCrossedBtoA = 0;
    }

    reset(){
        this.timesCrossed = 0;
        this.numberRestraint = -1;
        this.totalRestraints = 0;
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
        hasOneWayStreets = true;
        this.totalRestraints++;
    }

    tempRemoveRestraint(type){
        if (type == "Number"){
            this.storedRestraint = this.numberRestraint;
            this.numberRestraint = -1;
        }
        else if (type == "OneWay"){
            this.storedAtoB = this.canCrossAtoB;
            this.storedBtoA = this.canCrossBtoA;
            this.canCrossAtoB = true;
            this.canCrossBtoA = true;
        }
    }

    restoreRestraint(type){
        if (type == "Number"){
            this.numberRestraint = this.storedRestraint;
        }
        else if (type == "OneWay"){
            this.canCrossAtoB = this.storedAtoB;
            this.canCrossBtoA = this.storedBtoA;

            hasOneWayStreets = true;
        }
    }

    get oneWayRestraint() { return !(this.canCrossAtoB && this.canCrossBtoA); }

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

    cross(sourceNode) {
        if (!this.canCross(sourceNode) || ![this.ANode, this.BNode].includes(sourceNode)) {
            if (edgeCrossDebug) console.log(`cross called on edge ${this.id} with invalid node!`);
            return false;
        }
    
        this.timesCrossed++;
        sourceNode == this.ANode ? this.numTimesCrossedAtoB++ : this.numTimesCrossedBtoA++;
        return true;
    }
    
    uncross(sourceNode) {
        if (![this.ANode, this.BNode].includes(sourceNode)) {
            if (edgeCrossDebug) console.log(`uncross called on edge ${this.id} with invalid node!`);
            return false;
        }
    
        this.timesCrossed--;
        sourceNode == this.ANode ? this.numTimesCrossedAtoB-- : this.numTimesCrossedBtoA--;
    }

    canCross(sourceNode){ //Can you cross this edge starting at the given node
        //If the edge is full up to numberRestraint, no
        if (this.numberRestraint != -1 && this.timesCrossed == this.numberRestraint){
            if(edgeCrossDebug) { console.log(this.id + " is full to restraint") }
            return false
        }
        //If the edge is full up to maxCrosses, no
        if(this.timesCrossed == this.maxCrosses){
            if(edgeCrossDebug) { console.log(this.id + " is full to maxCrosses") }
            return false
        }
        //If the source node is not one of the attached nodes, no, obviously (this should never happen)
        if(sourceNode != this.ANode && sourceNode != this.BNode){
            if(edgeCrossDebug) { console.log("canCross called on edge " + this.id + " with invalid node!") }
            return false;
        }
        //If there's a one way restraint and we would be crossing it the wrong way, no
        if(this.oneWayRestraint) {
            if ((this.canCrossBtoA == false && sourceNode == this.BNode) || 
            (this.canCrossAtoB == false && sourceNode == this.ANode)) {
                if (edgeCrossDebug) { console.log("Can't cross one way restraint") }
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

    draw(){
        let [ALoc, BLoc] = [this.ANode.ScreenLoc(), this.BNode.ScreenLoc()];

        let color = getElementColor(this.timesCrossed);

        graphics.lineStyle(edgeWidth, color, 1.0);
        
        graphics.beginPath();
        graphics.moveTo(...ALoc);
        graphics.lineTo(...BLoc);
        graphics.stroke();
    }

    drawRestraints(){
        if(this.numberRestraint != -1){
            restraintTexts.push(scene.add.text((this.ScreenLoc())[0], 
                (this.ScreenLoc())[1], 
                this.numberRestraint, restraintConfig).setOrigin(0.5, 0.55));
        }
        if(this.oneWayRestraint){
            let [ANodeLoc, BNodeLoc] = [this.ANode.ScreenLoc(), this.BNode.ScreenLoc()];
            let [ALoc, BLoc] = [percentBetween(BNodeLoc, ANodeLoc, 0.80), percentBetween(ANodeLoc, BNodeLoc, 0.80)];
            graphics.lineStyle(3, 0x83BCFF, 1.0);

            let [CLoc, DLoc] = [[], []];
            let firstLoc, secondLoc;

            let horizontalOrVertical = this.ANode.y == this.BNode.y ? 1 : 0;

            [firstLoc, secondLoc] = this.canCrossAtoB ? [ALoc, BLoc] : [BLoc, ALoc];
            [CLoc[0], CLoc[1], DLoc[0], DLoc[1]] = this.canCrossAtoB ? [ALoc[0], ALoc[1], ALoc[0], ALoc[1]] : [BLoc[0], BLoc[1], BLoc[0], BLoc[1]];
            CLoc[horizontalOrVertical] -= edgeWidth / 5.1;
            DLoc[horizontalOrVertical] += edgeWidth / 5.1;
            
            graphics.beginPath();
            graphics.moveTo(...firstLoc);
            graphics.lineTo(...secondLoc);
            graphics.lineTo(...CLoc);
            graphics.lineTo(...DLoc);
            graphics.lineTo(...secondLoc);
            graphics.stroke();
        }
    }
}