import ACTORS from './actors/index';
import ACTIONS from './actions/index';
import PLANS from './plans/index';
import assert from 'assert';

export default class Engine {
  constructor() {
    // Set up staxx here
  }

  async run({ plans, actions, actors } = {}) {
    assert(
      (plans || (actors && actions)) && Object.keys(arguments[0]).length < 3,
      'must provide plans or actors/actions (but not both)'
    );

    const plan = plans ? this._importPlans(plans) : null;
    actions = actions ? actions : plan.actions;
    actors = actors ? this._importActors(actors) : plan.actors;

    let report = {
      results: [],
      success: true,
      completed: []
    };

    for (const action of actions) {
      if (report.success) {
        const importedAction = ACTIONS[action[1]];
        const importedActor = actors[action[0]];
        try {
          const result = await this._runAction(importedAction, importedActor);
          report.results.push(result);
          report.completed.push(action);
        } catch (err) {
          report.success = false;
          report.error = err;
          report.errorIndex = 0 + report.results.length;
        }
      }
    }

    return report;
  }

  async _runAction(action, actor) {
    if (action.before) await action.before(actor);
    const result = await action.operation(actor);
    if (action.after) await action.after(actor);
    return result;
  }

  _importActors(actors) {
    let importedActors = {};

    Object.keys(actors).forEach(name => {
      importedActors[name] = ACTORS[actors[name]](name);
    });

    return importedActors;
  }

  _importPlans(plans) {
    let actors = {};
    let actions = [];

    plans.forEach(plan => {
      const importedPlan = PLANS[plan];
      actors = this._importActors(importedPlan.actors);
      importedPlan.actions.forEach(action => {
        actions.push(action);
      });
    });

    return {
      actors: actors,
      actions: actions
    };
  }
}
