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

    drawRestraint(){
        if(this.isSatisfied()){
            this.labelConfig.color = '#04d104';
        } else {
            this.labelConfig.color = '#ff0404';
        }
        restraintTexts.push(scene.add.text(
            this.element.ScreenLoc()[0], 
            this.element.ScreenLoc()[1] + 1, 
            this.number, this.labelConfig
        ).setOrigin(0.5, 0.55));
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
        let color;
        if(this.isSatisfied()){
            color = 0x04d104;
        } else {
            color = 0xFF0404;
        }

        const ANode = this.element.ANode;
        const BNode = this.element.BNode;
        let [ANodeLoc, BNodeLoc] = [ANode.ScreenLoc(), BNode.ScreenLoc()];
        let [ALoc, BLoc] = [percentBetween(BNodeLoc, ANodeLoc, 0.80), percentBetween(ANodeLoc, BNodeLoc, 0.80)];
        graphics.lineStyle(3, color, 1.0);

        let [CLoc, DLoc] = [[], []];
        let firstLoc, secondLoc;

        let horizontalOrVertical = ANode.y == BNode.y ? 1 : 0;

        [firstLoc, secondLoc] = (this.direction == "AtoB") ? [ALoc, BLoc] : [BLoc, ALoc];
        [CLoc[0], CLoc[1], DLoc[0], DLoc[1]] = (this.direction == "AtoB") ? [ALoc[0], ALoc[1], ALoc[0], ALoc[1]] : [BLoc[0], BLoc[1], BLoc[0], BLoc[1]];
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