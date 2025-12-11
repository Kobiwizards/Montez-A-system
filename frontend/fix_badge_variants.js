const fs = require('fs');

const content = fs.readFileSync('app/admin/dashboard/page.tsx', 'utf8');

// Fix the getStatusBadge function
let fixed = content.replace(
  /const getStatusBadge = \(status: Tenant\['status'\]\) => \{[^}]+switch \(status\) \{[^}]+case 'CURRENT':[^}]+return <Badge variant="success">Current<\/Badge>[^}]+case 'OVERDUE':[^}]+return <Badge variant="warning">Overdue<\/Badge>[^}]+case 'DELINQUENT':[^}]+return <Badge variant="error">Delinquent<\/Badge>[^}]+default:[^}]+return <Badge variant="outline">\{status\}<\/Badge>[^}]+}/s,
  `const getStatusBadge = (status: Tenant['status']) => {
    switch (status) {
      case 'CURRENT':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Current</Badge>
      case 'OVERDUE':
        return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">Overdue</Badge>
      case 'DELINQUENT':
        return <Badge variant="destructive">Delinquent</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }`
);

// Also fix the badges in the stats cards
fixed = fixed.replace(
  /<Badge variant="success" className="h-6 w-6 flex items-center justify-center">/g,
  '<Badge className="h-6 w-6 flex items-center justify-center bg-green-500 hover:bg-green-600">'
);

fixed = fixed.replace(
  /<Badge variant="warning" className="h-6 w-6 flex items-center justify-center">/g,
  '<Badge className="h-6 w-6 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600">'
);

fixed = fixed.replace(
  /<Badge variant="error" className="h-6 w-6 flex items-center justify-center">/g,
  '<Badge className="h-6 w-6 flex items-center justify-center bg-red-500 hover:bg-red-600">'
);

fs.writeFileSync('app/admin/dashboard/page.tsx', fixed);
console.log('Fixed badge variants!');
