import EmptyState from "../components/common/EmptyState";

function Dashboard() {
    return (
        <div className="px-8 py-8">
            {/* Greeting */}
            <section>
                <h1 className="text-2xl font-bold text-slate-800">
                    Good evening!
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Let's finish what we started.
                </p>
            </section>

            {/* Tasks */}
            <section className="mt-8">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">
                        My Tasks
                    </h2>
                </div>

                <EmptyState
                    title="No tasks yet"
                    description="Start organizing your work by adding your first task."
                    actionLabel="Add Task"
                />
            </section>
        </div>
    );
}

export default Dashboard;