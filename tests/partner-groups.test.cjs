const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');

function screen(params, response) {
  const requests = [];
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync('src/features/resources/PartnerScreens.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const refresh = () => {};
  const mocks = {
    'expo-router': { useLocalSearchParams: () => params },
    '@/features/entry/copy': { useCopy: () => value => value },
    '@/features/settings/RemoteSettingsScreen': {
      isRecord: value => value !== null && typeof value === 'object' && !Array.isArray(value),
      DataDetails: 'DataDetails',
      useRemoteData: path => { requests.push(path); return { loading: false, error: '', refresh, ...response }; },
    },
  };
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(name => {
    if (mocks[name]) return mocks[name];
    if (name === 'react/jsx-runtime') return require(name);
    return new Proxy({}, { get: (_, key) => key });
  }, module, module.exports);
  const branch = module.exports.PartnerGroupsScreen();
  return { tree: branch.type(branch.props), requests, refresh };
}

function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  return [node, ...[node.props?.children].flat(Infinity).flatMap(nodes)];
}

test('group detail opens the requested backend ID and never renders the collection or creation form', () => {
  const group = { group_id: 'group /?#', name: 'My group', member_ids: ['p1', 'p2'] };
  const { tree, requests, refresh } = screen({ groupId: group.group_id }, { data: group });
  assert.deepEqual(requests, ['/partner-groups/group%20%2F%3F%23']);
  assert.equal(tree.props.title, group.name);
  assert.deepEqual(nodes(tree).find(node => node.type === 'DataDetails').props.value, group);
  assert.equal(nodes(tree).some(node => node.type === 'ServerForm'), false);
  assert.equal(nodes(tree).find(node => node.type === 'MobileAction').props.onPress, refresh);
});

test('group detail displays loading and API failures without showing stale group details or a create form', () => {
  for (const response of [{ loading: true }, { error: 'Partner Group not found' }]) {
    const { tree } = screen({ groupId: 'missing' }, { data: { name: 'Old group' }, ...response });
    const content = nodes(tree);
    assert.equal(content.some(node => node.type === 'DataDetails' || node.type === 'ServerForm'), false);
    assert.equal(content.some(node => node.type === 'LoadingState'), !!response.loading);
    assert.equal(content.some(node => node.type === 'InlineAlert'), !!response.error);
  }
});

test('without groupId the existing group collection and create form remain available', () => {
  const { tree, requests } = screen({}, { data: [] });
  assert.deepEqual(requests, ['/partner-groups', '/partners']);
  const form = nodes(tree).find(node => node.type === 'ServerForm');
  assert.equal(form.props.path, '/partner-groups');
  assert.equal(form.props.method, 'post');
});
