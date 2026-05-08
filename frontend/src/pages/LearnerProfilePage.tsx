import { mockLearners } from "../data/mockData";

export function LearnerProfilePage() {
    return (
        <section className="panel">
            <h2>Learner Profiles</h2>
            <p>Single source of truth for learner lifecycle and programme progression.</p>
            <ul className="card-list">
                {mockLearners.map((learner) => (
                    <li key={learner.learnerId}>
                        <h3>
                            {learner.firstName} {learner.lastName}
                        </h3>
                        <p>{learner.programmeName}</p>
                        <p>Completion target: {learner.expectedCompletionDate}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
