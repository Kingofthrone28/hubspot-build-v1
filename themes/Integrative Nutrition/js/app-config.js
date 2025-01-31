if (IIN) {
  IIN.config = {
    portalID: '{{ hub_id }}',
  };
} else {
  console.warn(`Failed to find IIN object to attach config!`);
}
