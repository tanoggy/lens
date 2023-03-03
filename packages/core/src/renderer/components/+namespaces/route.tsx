/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./namespaces.scss";

import React from "react";
import { AddNamespaceDialog } from "./add-dialog/dialog";
import { TabLayout } from "../layout/tab-layout-2";
import { Badge } from "../badge";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import type { NamespaceStore } from "./store";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "./store.injectable";
import { KubeObjectAge } from "../kube-object/age";
import openAddNamepaceDialogInjectable from "./add-dialog/open.injectable";
import { SubnamespaceBadge } from "./subnamespace-badge";
import { NamespaceMenu } from "./namespace-menu";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";
import type { Namespace } from "../../../common/k8s-api/endpoints";
import deleteNamespaceInjectable from "./delete-namespace.injectable";

enum columnId {
  name = "name",
  labels = "labels",
  age = "age",
  status = "status",
}

interface Dependencies {
  namespaceStore: NamespaceStore;
  openAddNamespaceDialog: () => void;
  openConfirmDialog: OpenConfirmDialog;
  deleteNamespace: (namespace: Namespace) => Promise<void>;
}

const NonInjectedNamespacesRoute = ({ namespaceStore, openAddNamespaceDialog, openConfirmDialog, deleteNamespace }: Dependencies) => {
  function onConfirm() {
    const namespaces = namespaceStore.selectedItems;

    namespaces.forEach(deleteNamespace);
  }

  const openRemoveNamespaceDialog = () => {
    const namespaces = namespaceStore.selectedItems;
    const message = (
      <div>
        <>
          Remove following namespaces?
          {" "}
          <div className="confirm-dialog-scrollable-content">
            {namespaces.map(namespace => (
              <li key={namespace.getId()}>{namespace.getName()}</li>
            ))}
          </div>
        </>
      </div>
    );

    openConfirmDialog({
      ok: onConfirm,
      labelOk: "Remove",
      message,
    });
  }

  return (
    <TabLayout>
      <KubeObjectListLayout
        isConfigurable
        tableId="namespaces"
        className="Namespaces"
        store={namespaceStore}
        sortingCallbacks={{
          [columnId.name]: namespace => namespace.getName(),
          [columnId.labels]: namespace => namespace.getLabels(),
          [columnId.age]: namespace => -namespace.getCreationTimestamp(),
          [columnId.status]: namespace => namespace.getStatus(),
        }}
        searchFilters={[
          namespace => namespace.getSearchFields(),
          namespace => namespace.getStatus(),
        ]}
        renderHeaderTitle="Namespaces"
        renderTableHeader={[
          { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
          { className: "warning", showWithColumn: columnId.name },
          { title: "Labels", className: "labels scrollable", sortBy: columnId.labels, id: columnId.labels },
          { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
          { title: "Status", className: "status", sortBy: columnId.status, id: columnId.status },
        ]}
        renderTableContents={namespace => [
          <>
            {namespace.getName()}
            {namespace.isSubnamespace() && (
              <SubnamespaceBadge className="subnamespaceBadge" id={`namespace-list-badge-for-${namespace.getId()}`} />
            )}
          </>,
          <KubeObjectStatusIcon key="icon" object={namespace} />,
          namespace.getLabels().map(label => (
            <Badge
              scrollable
              key={label}
              label={label}
            />
          )),
          <KubeObjectAge key="age" object={namespace} />,
          { title: namespace.getStatus(), className: namespace.getStatus().toLowerCase() },
        ]}
        addRemoveButtons={{
          addTooltip: "Add Namespace",
          onAdd: openAddNamespaceDialog,
          onRemove: openRemoveNamespaceDialog,
        }}
        renderItemMenu={namespace => (
          <NamespaceMenu
            namespace={namespace}
          />
        )}
      />
      <AddNamespaceDialog/>
    </TabLayout>
  );
}


export const NamespacesRoute = withInjectables<Dependencies>(NonInjectedNamespacesRoute, {
  getProps: (di) => ({
    namespaceStore: di.inject(namespaceStoreInjectable),
    openAddNamespaceDialog: di.inject(openAddNamepaceDialogInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    deleteNamespace: di.inject(deleteNamespaceInjectable),
  }),
});
