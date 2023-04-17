import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import activeDockTabIdStateInjectable from "./active-dock-tab-id-state.injectable";
import { pipeline } from "@ogre-tools/fp";
import { defaults, find } from "lodash/fp";
import dockTabsInjectable, { DockTabViewModel } from "./dock-tabs.injectable";

const nullTab: DockTabViewModel = {
  id: "no-active-dock-tab",

  type: {
    id: "no-active-dock-tab-type",
    TitleComponent: () => null,
    ContentComponent: () => null,
  },

  activate: () => {},
  close: () => {},
};

const activeDockTabInjectable = getInjectable({
  id: "active-dock-tab",

  instantiate: (di) => {
    const dockTabs = di.inject(dockTabsInjectable);
    const activeDockTabId = di.inject(activeDockTabIdStateInjectable);

    return computed(() => {
      const tabs = dockTabs.get();

      return pipeline(
        tabs,
        find((tab) => tab.id === activeDockTabId.get()),
        defaults(nullTab),
      );
    });
  },
});

export default activeDockTabInjectable;