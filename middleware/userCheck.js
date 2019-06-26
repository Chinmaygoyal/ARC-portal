function isStudent(req, res, next) {
  if (req.user.is_prof)
    return res.status(401).send("Page accessible by students only.");
  else next();
}

function isProf(req, res, next) {
  if (!req.user.is_prof)
    return res.status(401).send("Page accessible by professors only.");
  else next();
}

exports.isStudent = isStudent;
exports.isProf = isProf;
