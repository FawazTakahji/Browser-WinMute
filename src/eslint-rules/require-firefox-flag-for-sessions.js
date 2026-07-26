/*
ESLint rule to enforce that browser.sessions.setWindowValue, getWindowValue, and removeWindowValue
are accessed only within an import.meta.env.FIREFOX guard evaluating to true.
*/

function isImportMetaEnvFirefox(node) {
  if (!node) return false;

  if (node.type === 'MemberExpression') {
    const object = node.object;
    return (
        object &&
        object.type === 'MemberExpression' &&
        object.object &&
        object.object.type === 'MetaProperty' &&
        object.object.meta.name === 'import' &&
        object.object.property.name === 'meta' &&
        object.property.name === 'env' &&
        node.property.name === 'FIREFOX'
    );
  }

  if (node.type === 'BinaryExpression') {
    if (node.operator === '===' || node.operator === '==') {
      if (node.right.type === 'Literal' && node.right.value === false) return false;
      if (node.left.type === 'Literal' && node.left.value === false) return false;
    }
    return isImportMetaEnvFirefox(node.left) || isImportMetaEnvFirefox(node.right);
  }

  if (node.type === 'LogicalExpression' && node.operator === '&&') {
    return isImportMetaEnvFirefox(node.left);
  }

  return false;
}

function isGuardedByFirefoxIf(node) {
  let child = node;
  let current = node.parent;

  while (current) {
    if (current.type === 'IfStatement') {
      const isConsequentBranch = current.consequent === child || isParentOf(current.consequent, child);
      const isAlternateBranch = current.alternate === child || isParentOf(current.alternate, child);

      if (isImportMetaEnvFirefox(current.test) && isConsequentBranch) {
        return true;
      }

      if (
          current.test.type === 'UnaryExpression' &&
          current.test.operator === '!' &&
          isImportMetaEnvFirefox(current.test.argument) &&
          isAlternateBranch
      ) {
        return true;
      }

      if (
          current.test.type === 'BinaryExpression' &&
          (current.test.operator === '===' || current.test.operator === '==')
      ) {
        const isFalseCheck =
            (isImportMetaEnvFirefox(current.test.left) && current.test.right.value === false) ||
            (isImportMetaEnvFirefox(current.test.right) && current.test.left.value === false);

        if (isFalseCheck && isAlternateBranch) {
          return true;
        }
      }
    }

    if (current.type === 'LogicalExpression' && current.operator === '&&') {
      if (isImportMetaEnvFirefox(current.left) && current.right === child) {
        return true;
      }
    }

    child = current;
    current = current.parent;
  }

  return false;
}

function isParentOf(parent, child) {
  if (!parent) return false;
  let curr = child.parent;
  while (curr) {
    if (curr === parent) return true;
    curr = curr.parent;
  }
  return false;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
          'Require browser.sessions.setWindowValue, getWindowValue, and removeWindowValue to be inside an import.meta.env.FIREFOX guard evaluating to true',
      category: 'Possible Errors',
      recommended: true,
    },
    messages: {
      requireFirefoxGuard:
          "browser.sessions.{{ methodName }} is Firefox-only and must be guarded by an 'import.meta.env.FIREFOX' check.",
    },
    schema: [],
  },
  create(context) {
    const TARGET_METHODS = new Set(['setWindowValue', 'getWindowValue', 'removeWindowValue']);

    return {
      MemberExpression(node) {
        const propName = node.property && node.property.name;
        if (TARGET_METHODS.has(propName)) {
          const obj = node.object;
          const isSessionsAccess =
              (obj && obj.type === 'MemberExpression' && obj.property && obj.property.name === 'sessions') ||
              (obj && obj.type === 'Identifier' && obj.name === 'sessions');

          if (isSessionsAccess && !isGuardedByFirefoxIf(node)) {
            context.report({
              node,
              messageId: 'requireFirefoxGuard',
              data: {
                methodName: propName,
              },
            });
          }
        }
      },
    };
  },
};