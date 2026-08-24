import { DemoClassificationProvider } from "@/classification/demo-provider";
import { RuleBasedClassificationProvider } from "@/classification/rule-based-provider";
import type {
  ClassificationProvider,
  ClassificationProviderId,
} from "@/domain/models";

const providers: Record<ClassificationProviderId, ClassificationProvider> = {
  demo: new DemoClassificationProvider(),
  "rule-based": new RuleBasedClassificationProvider(),
};

export function getClassificationProvider(id: ClassificationProviderId) {
  return providers[id];
}

export function listClassificationProviders() {
  return Object.values(providers).map(({ id, name }) => ({ id, name }));
}
