let restraintConfig = {
    fontFamily: 'Consolas',
    color: '#ff0404',
    align: 'center',
    fontStyle: 'bold'
}

const restraintDict = {
    "Number": "numberRestraint",
    "OneWay": "oneWayRestraint"
};

class Restraint {
    constructor(element) {
        this.element = element;
        this.type = "None";
    }
}

class NumberRestraint extends Restraint {
    constructor(element) {
        super(element);
        this.type = "Number";
        this.number = element.timesCrossed;
        this.labelConfig = restraintConfig;
    }

    isSatisfied() {
        return (this.element.timesCrossed == this.number)    
    }
}

class OneWayRestraint extends Restraint {
    constructor(element, direction) {
        super(element);
        this.type = "OneWay";
        this.direction = direction;
    }

    canCross(sourceNode){
        if (this.direction == "AtoB"){
            return sourceNode == this.element.ANode;
        } else if (this.direction == "BtoA"){
            return sourceNode == this.element.BNode;
        } 
    }

    isSatisfied() {
        return (this.element.timesCrossed >= 1);
    }

    drawRestraint(){
        let graphics = graphicsLayers.arrowRestraints;
        let color;
        if(this.isSatisfied()){
            color = 0x04d104;
        } else {
            color = 0xFF0404;
        }

        const ANode = this.element.ANode;
        const BNode = this.element.BNode;
        let [ANodeLoc, BNodeLoc] = [ANode.ScreenLoc(), BNode.ScreenLoc()];
        let ALoc = percentBetween(BNodeLoc, ANodeLoc, 0.70)
        let BLoc = percentBetween(ANodeLoc, BNodeLoc, 0.70);
        graphics.lineStyle(3, color, 1.0);

        let [CLoc, DLoc] = [[], []];

        let horizontalOrVert = ANode.y == BNode.y ? 1 : 0;

        let arrowTip = (this.direction == "AtoB") ? BLoc : ALoc;
        [CLoc[0], CLoc[1], DLoc[0], DLoc[1]] = (this.direction == "AtoB") ? [...ALoc, ...ALoc] : [...BLoc, ...BLoc];
        CLoc[horizontalOrVert] -= edgeWidth / 5.1;
        DLoc[horizontalOrVert] += edgeWidth / 5.1;
        
        graphics.beginPath();
        graphics.lineTo(...arrowTip);
        graphics.lineTo(...CLoc);
        graphics.lineTo(...DLoc);
        graphics.lineTo(...arrowTip);
        graphics.stroke();
    }
}