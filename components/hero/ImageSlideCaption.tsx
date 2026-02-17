"use client";

export default function ImageSlideCaption({ index }: { index: number }) {
  if (index === 1) {
    return (
      <div className="max-w-[520px] text-white">
        <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-medium ring-1 ring-white/15">
          Discovering God-Given Identity
        </div>

        <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
          Where every life carries a distinct imprint.
        </h2>

        <p className="mt-3 max-w-[58ch] text-sm text-white/75 md:text-base">
          A gathering that helps teens recognize their unique value in Christ
          and grow together in faith.
        </p>
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="max-w-[520px] text-white">
        <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-medium ring-1 ring-white/15">
          Evangelical Youth Collaboration
        </div>

        <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
          Serving the next generation together.
        </h2>

        <p className="mt-3 max-w-[58ch] text-sm text-white/75 md:text-base">
          An annual gathering connecting Evangelical churches to strengthen
          youth ministry across Mongolia.
        </p>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="max-w-[520px] text-white">
        <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-medium ring-1 ring-white/15">
          National Youth Seminar
        </div>

        <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
          A collaborative youth ministry initiative
        </h2>

        <p className="mt-3 max-w-[58ch] text-sm text-white/75 md:text-base">
          “Finger Print” brings churches together to nurture, guide, and support
          Mongolia’s teenagers in Christ.
        </p>
      </div>
    );
  }
}
