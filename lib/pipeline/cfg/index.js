'use strict';

var util = require('util');

var pipeline = require('../../pipeline');
var Pipeline = pipeline.Pipeline;

function CFGBuilder() {
  Pipeline.call(this);

  this.blocks = [];
  this.currentBlock = null;
}
util.inherits(CFGBuilder, Pipeline);
module.exports = CFGBuilder;

CFGBuilder.Block = require('./block');

CFGBuilder.create = function create() {
  return new CFGBuilder();
};

CFGBuilder.prototype.block = function block(opcode) {
  var res = CFGBuilder.Block.create(opcode);
  this.nodes.push(res);
  this.blocks.push(res);
  this.setCurrentBlock(res);
  return res;
};

CFGBuilder.prototype.jumpFrom = function jumpFrom(other) {
  var res = this.block();
  other.jump(res);
  res.setControl(other.getLastControl());
  return res;
};

CFGBuilder.prototype.merge = function merge(left, right) {
  var res = this.block();
  left.jump(res);
  right.jump(res);

  res.setControl(left.getLastControl(), right.getLastControl());
  return res;
};

CFGBuilder.prototype.setCurrentBlock = function setCurrentBlock(block) {
  this.currentBlock = block;
};

CFGBuilder.prototype.add = function add() {
  var node = Pipeline.prototype.add.apply(this, arguments);
  this.currentBlock.add(node);
  return node;
};

CFGBuilder.prototype.addControl = function addControl() {
  var node = this.add.apply(this, arguments);
  node.setControl(this.currentBlock);
  return node;
};