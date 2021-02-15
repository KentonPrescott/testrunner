import { DAI } from '@makerdao/dai-plugin-mcd';

export default {
  operation: async (user, { maker }) => {
    const proxy = await maker.service('proxy').getProxyAddress();
    const cdpIds = await maker.service('mcd:cdpManager').getCdpIds(proxy, true);
    const cdp = await maker.service('mcd:cdpManager').getCdp(cdpIds[0].id);

    const dai = maker.getToken(DAI);
    await dai.approveUnlimited(proxy);

    await cdp.wipeDai(100);

    return cdp;
  },
  after: () => {},
  category: 'cdp'
};
