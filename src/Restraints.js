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
        this.fontSize = restraintConfig.fontSize;
    }

    isSatisfied() {
        return (this.element.timesCrossed == this.number)    
    }
}

class OneWayRestraint extends Restraint {
    constructor(element) {
        super(element);
        this.type = "OneWay";
    }

    isSatisfied() {
        return (this.element.timesCrossed >= 1);
    }
}